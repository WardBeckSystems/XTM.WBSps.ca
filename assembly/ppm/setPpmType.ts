/*! Copyright (c) 2026 Ward-Beck Systems (Ward-Beck.ca). All rights reserved. */
import { ppmType } from "./state";
import { updatePpmDecay } from "./updatePpmDecay";
import { PPM_TYPE_I } from "./standards/typeI_DIN45406";
import { PPM_TYPE_II } from "./standards/typeII_BBC_BS4297";
import { PPM_FAST_DIGITAL } from "./standards/fastDigitalQP";

export function setPpmType(type: i32): void {
  ppmType = (type >= PPM_TYPE_I && type <= PPM_FAST_DIGITAL) ? type : PPM_TYPE_II;
  updatePpmDecay();
}
