import type { Analecta } from "../exp/analecta";

export interface SayingLoader {
  load(): Promise<Analecta>;
}
