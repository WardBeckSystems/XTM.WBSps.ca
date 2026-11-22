#!/usr/bin/env python3
# Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved.
"""
Ward-Beck Systems XTM-4 — FTP Deployment Script
==============================================
Deploys the XTM.WBSps.ca standalone application to the remote server (WBSps.ca).
- Automatically loads credentials from docker/.env or local environment.
- Recursively creates remote directories and uploads HTML, JS, CSS, SVG, PNG, and .htaccess.
- Verifies remote deployment over HTTPS.

Usage:
  python3 deploy.py                      # Deploy to remote server
  python3 deploy.py --remote-dir /       # Deploy to root
  python3 deploy.py --remote-dir /XTM    # Deploy to /XTM subfolder
  python3 deploy.py --help
"""

import sys
import os
import ftplib
import argparse
import time
import urllib.request
import ssl
import json
import re
import subprocess
import shutil
from pathlib import Path

HERE = Path(__file__).resolve().parent

# File / folder ignore list for public web deployment
IGNORE_ITEMS = {
    '.git',
    '.gitignore',
    '__pycache__',
    '.env',
    'server.py',
    'run.sh',
    'deploy.py',
    'deploy.sh',
    '.ftpquota'
}

def load_env_credentials():
    """Load credentials from environment or nearest .env file."""
    creds = {
        'host': os.environ.get('FTP_HOST', 'wbsps.ca'),
        'user': os.environ.get('FTP_USER_NAME', 'wbsps@wbsps.ca'),
        'pass': os.environ.get('FTP_USER_PASS', ''),
        'port': int(os.environ.get('FTP_PORT', '21'))
    }

    env_paths = [
        HERE / '.env',
        HERE.parent / 'docker' / '.env',
        HERE.parent / '.env'
    ]

    for p in env_paths:
        if p.is_file():
            try:
                for line in p.read_text(encoding='utf-8').splitlines():
                    line = line.strip()
                    if not line or line.startswith('#') or '=' not in line:
                        continue
                    k, v = line.split('=', 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k in ('FTP_HOST', 'FTP_SERVER'):
                        creds['host'] = v
                    elif k in ('FTP_USER', 'FTP_USER_NAME', 'FTP_LOGIN'):
                        creds['user'] = v
                    elif k in ('FTP_PASS', 'FTP_USER_PASS', 'FTP_PASSWORD'):
                        creds['pass'] = v
                    elif k == 'FTP_PORT':
                        creds['port'] = int(v)
            except Exception:
                pass
            break

    return creds

def ensure_remote_dir(ftp, remote_path):
    """Ensure a directory path exists on the remote FTP server."""
    if remote_path in ('', '/', '.'):
        ftp.cwd('/')
        return

    parts = [p for p in remote_path.strip('/').split('/') if p]
    ftp.cwd('/')
    for part in parts:
        try:
            ftp.cwd(part)
        except ftplib.error_perm:
            try:
                ftp.mkd(part)
                ftp.cwd(part)
            except ftplib.error_perm as e:
                # May have been created concurrently or permission error
                try:
                    ftp.cwd(part)
                except Exception:
                    raise e

def upload_tree(ftp, local_dir, remote_base):
    """Recursively upload all files from local_dir to remote_base."""
    uploaded_files = []
    total_bytes = 0

    for root, dirs, files in os.walk(local_dir):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_ITEMS and not d.startswith('.')]

        rel_dir = os.path.relpath(root, local_dir).replace('\\', '/')
        if rel_dir == '.':
            target_remote = remote_base
        else:
            target_remote = f"{remote_base.rstrip('/')}/{rel_dir}"

        ensure_remote_dir(ftp, target_remote)

        for fn in sorted(files):
            if fn in IGNORE_ITEMS or fn.startswith('.'):
                if fn != '.htaccess':
                    continue

            local_path = os.path.join(root, fn)
            file_size = os.path.getsize(local_path)
            rel_file = os.path.relpath(local_path, local_dir).replace('\\', '/')

            print(f"  ▲ Uploading {rel_file} ({file_size:,} bytes)...", end="", flush=True)
            with open(local_path, 'rb') as f:
                ftp.storbinary(f"STOR {fn}", f)
            print(" [OK]")

            uploaded_files.append(rel_file)
            total_bytes += file_size

    return uploaded_files, total_bytes

def verify_site(url, expected_str="Ward-Beck Systems"):
    """Verify that the site responds over HTTPS."""
    print(f"\nVerifying {url}...")
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'Mozilla/5.0 (Ward-Beck Systems Deploy Verifier)'}
    )
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=8) as resp:
            status = resp.status
            body = resp.read(2048).decode('utf-8', errors='ignore')
            has_match = expected_str in body
            print(f"  ✔ HTTP {status} OK (content match '{expected_str}': {'YES' if has_match else 'NO'})")
            return status == 200 and has_match
    except Exception as e:
        print(f"  ⚠ Verification note: {e}")
        return False

def get_current_version(repo_dir: Path) -> str:
    """Read current version from package.json."""
    pkg_path = repo_dir / 'package.json'
    if pkg_path.is_file():
        try:
            with open(pkg_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('version', '1.0.0')
        except Exception:
            pass
    return '1.0.0'

def bump_version(repo_dir: Path, bump_type: str = 'patch', set_version: str = None) -> tuple[str, str]:
    """Increments the version in package.json (and package-lock.json if available).
    Returns (old_version, new_version).
    """
    old_version = get_current_version(repo_dir)

    if set_version:
        new_version = set_version.lstrip('v').strip()
    else:
        match = re.match(r'^(\d+)\.(\d+)\.(\d+)(.*)$', old_version)
        if match:
            major, minor, patch, suffix = match.groups()
            if bump_type == 'major':
                new_version = f"{int(major) + 1}.0.0"
            elif bump_type == 'minor':
                new_version = f"{major}.{int(minor) + 1}.0"
            else:  # patch
                new_version = f"{major}.{minor}.{int(patch) + 1}"
        else:
            parts = old_version.split('.')
            if parts and parts[-1].isdigit():
                parts[-1] = str(int(parts[-1]) + 1)
                new_version = '.'.join(parts)
            else:
                new_version = f"{old_version}.1"

    # Attempt to update via npm version to keep package-lock.json in sync
    npm_ok = False
    try:
        res = subprocess.run(
            ['npm', 'version', new_version, '--no-git-tag-version', '--allow-same-version'],
            cwd=str(repo_dir),
            capture_output=True,
            text=True
        )
        if res.returncode == 0:
            npm_ok = True
    except Exception:
        pass

    if not npm_ok:
        pkg_path = repo_dir / 'package.json'
        try:
            with open(pkg_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            data['version'] = new_version
            with open(pkg_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
                f.write('\n')
        except Exception as e:
            print(f"  ⚠ Warning: Could not write package.json: {e}", file=sys.stderr)

    return old_version, new_version

def update_index_html_version(repo_dir: Path, version: str):
    """Synchronize the build-stamp span in index.html to match the current version."""
    index_path = repo_dir / 'index.html'
    if not index_path.is_file():
        return
    ver_tag = version if version.startswith('v') else f"v{version}"
    try:
        content = index_path.read_text(encoding='utf-8')
        updated = re.sub(
            r'(<span class="build-stamp"[^>]*>)[^<]*(</span>)',
            rf'\g<1>{ver_tag}\g<2>',
            content
        )
        if updated != content:
            index_path.write_text(updated, encoding='utf-8')
    except Exception:
        pass

def main():
    creds = load_env_credentials()

    parser = argparse.ArgumentParser(description="Deploy XTM.WBSps.ca to WBSps.ca via FTP")
    parser.add_argument("--host", default=creds['host'], help=f"FTP host (default: {creds['host']})")
    parser.add_argument("--port", type=int, default=creds['port'], help=f"FTP port (default: {creds['port']})")
    parser.add_argument("--user", default=creds['user'], help=f"FTP username (default: {creds['user']})")
    parser.add_argument("--password", default=creds['pass'], help="FTP password")
    parser.add_argument("--remote-dir", default=None,
                        help="Target remote directory (auto-detects 'XTM/' vs root)")
    parser.add_argument("--no-verify", action="store_true", help="Skip post-deployment HTTP verification")
    parser.add_argument("--bump", choices=['patch', 'minor', 'major'], default='patch',
                        help="Increment version type: patch (default), minor, or major")
    parser.add_argument("--no-bump", action="store_true",
                        help="Skip version increment for this deploy")
    parser.add_argument("--set-version", default=None,
                        help="Explicitly set a version (e.g. 1.2.0) instead of auto-incrementing")
    parser.add_argument("--dry-run", action="store_true",
                        help="Bump version and build dist/ without connecting to FTP")

    args = parser.parse_args()

    # 1. Version Increment Step
    if args.no_bump:
        active_version = get_current_version(HERE)
        ver_info = f"v{active_version} (bump skipped via --no-bump)"
    else:
        old_ver, new_ver = bump_version(HERE, bump_type=args.bump, set_version=args.set_version)
        update_index_html_version(HERE, new_ver)
        active_version = new_ver
        bump_desc = f"set to v{new_ver}" if args.set_version else f"{args.bump} bump"
        ver_info = f"v{old_ver} -> v{new_ver} ({bump_desc})"

    print("=" * 68)
    print(" Ward-Beck Systems — XTM.WBSps.ca Deployment")
    print("=" * 68)
    print(f" Version       : {ver_info}")
    print(f" Target Server : {args.host}:{args.port}")
    print(f" FTP Account   : {args.user}")
    print(f" Local Source  : {HERE}")
    print("-" * 68)

    # 2. Build TypeScript & WebAssembly before deployment
    print(f"\nExecuting TypeScript + WebAssembly build (npm run build) for v{active_version}...")
    res = subprocess.run(["npm", "run", "build"], cwd=str(HERE), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Build failed:\n{res.stderr}\n{res.stdout}", file=sys.stderr)
        sys.exit(1)
    print(f"✔ Build successful: dist/ ready for deployment (v{active_version}).")

    # 3. Validate & build Ward-Beck Audio Tab controller daemon
    for r_name in ("ward-beck-audio-tab.py", "wbs-audio-router.py"):
        router_script = HERE / "tools" / r_name
        if router_script.is_file():
            print(f"\nExecuting Ward-Beck Audio Tab self-test ({r_name} --check)...")
            res = subprocess.run([sys.executable, str(router_script), "--check"], capture_output=True, text=True)
            if res.returncode != 0:
                print(f"❌ Error validating {r_name}:\n{res.stderr}\n{res.stdout}", file=sys.stderr)
                sys.exit(1)
            print(f"✔ {r_name} validated.")

            # Ensure present in dist/tools
            dist_tools_dir = HERE / "dist" / "tools"
            dist_tools_dir.mkdir(parents=True, exist_ok=True)
            if router_script.is_symlink():
                target = os.readlink(router_script)
                dest = dist_tools_dir / r_name
                if dest.exists() or dest.is_symlink():
                    dest.unlink()
                os.symlink(target, dest)
            else:
                shutil.copy(router_script, dist_tools_dir / r_name)
                os.chmod(dist_tools_dir / r_name, 0o755)

    print("Copying assets to dist/assets...")
    assets_dir = HERE / "assets"
    dist_assets_dir = HERE / "dist" / "assets"
    if assets_dir.is_dir():
        dist_assets_dir.mkdir(parents=True, exist_ok=True)
        for item in os.listdir(assets_dir):
            src_item = assets_dir / item
            if src_item.is_file():
                shutil.copy(src_item, dist_assets_dir / item)
    else:
        print("  ⚠ Warning: 'assets' folder not found, skipping asset copy.")

    if args.dry_run:
        print("\n✔ [DRY RUN] Build verified. Skipping FTP upload and remote verification.")
        print(f" Active version in package.json and dist/version.json: v{active_version}")
        return

    t0 = time.time()

    if not args.password:
        print("❌ Error: No FTP password provided. Set FTP_USER_PASS in docker/.env or pass --password.", file=sys.stderr)
        sys.exit(1)

    print(f"\nConnecting to {args.host}:{args.port} via FTPS (TLS)...")
    try:
        ftp = ftplib.FTP_TLS()
        ftp.connect(args.host, args.port, timeout=15)
        banner = ftp.getwelcome()
        print(f"Connected: {banner.splitlines()[0] if banner else 'OK'}")

        print(f"Authenticating as {args.user}...")
        ftp.login(args.user, args.password)
        ftp.prot_p()
        print("FTPS authentication successful (TLS data channel secured)!")
    except Exception as e_tls:
        print(f"FTPS fallback ({e_tls}). Connecting via plain FTP...")
        ftp = ftplib.FTP()
        ftp.connect(args.host, args.port, timeout=15)
        banner = ftp.getwelcome()
        print(f"Connected: {banner.splitlines()[0] if banner else 'OK'}")
        print(f"Authenticating as {args.user}...")
        ftp.login(args.user, args.password)
        print("Authentication successful!")

    try:

        # Auto-detect target directory:
        # If the account root contains 'XTM' directory or path says Wbsps.ca, deploy into XTM/
        remote_target = args.remote_dir
        if remote_target is None:
            listing = []
            try:
                listing = ftp.nlst()
            except Exception:
                pass

            if 'XTM' in listing:
                remote_target = '/XTM'
                print("Auto-detected target folder: '/XTM' (inside Wbsps.ca)")
            else:
                remote_target = '/'
                print("Auto-detected target folder: '/' (already inside XTM)")

        dist_dir = HERE / "dist"
        upload_source = str(dist_dir) if dist_dir.is_dir() else str(HERE)

        # Deploy files into target
        print(f"\nDeploying hosted application files from '{upload_source}' to '{remote_target}'...")
        files_uploaded, bytes_uploaded = upload_tree(ftp, upload_source, remote_target)
        print(f"✔ Completed '{remote_target}': {len(files_uploaded)} files ({bytes_uploaded:,} bytes)")

        ftp.quit()
        elapsed = time.time() - t0
        print(f"\nFTP transfer complete in {elapsed:.2f}s!")

    except Exception as e:
        print(f"\n❌ Deployment failed: {e}", file=sys.stderr)
        sys.exit(1)

    # Verification cycle
    if not args.no_verify:
        smoke_script = HERE.parent / "tools" / "smoke_test.py"
        if smoke_script.is_file():
            print("\nCoordinating ecosystem smoke test check-in...")
            subprocess.run([sys.executable, str(smoke_script)], check=False)
        else:
            test_urls = [
                ("https://xtm.wbsps.ca/", "Ward-Beck Systems"),
                ("https://ward-beck.ca/", "Ward-Beck Systems")
            ]
            print("\nCycling test URLs...")
            for url, expected in test_urls:
                verify_site(url, expected)

    print("\n" + "=" * 68)
    print(" Hosted Deployment Complete!")
    print(" Live URLs: https://xtm.wbsps.ca/ | https://ward-beck.ca/")
    print("=" * 68)

if __name__ == '__main__':
    main()
