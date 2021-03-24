import type { Analecta } from "../exp/analecta";
import type { Message } from "./message";

export interface CommandProcessor {
  (analaecta: Analecta, msg: Message): Promise<boolean>;
}

const connectBin = (
  left: CommandProcessor,
  right: CommandProcessor,
): CommandProcessor => async (
  analaecta: Analecta,
  msg: Message,
): Promise<boolean> => (await left(analaecta, msg)) || right(analaecta, msg);

export const connectProcessors = (
  procs: CommandProcessor[],
): CommandProcessor => procs.reduce(connectBin, () => Promise.resolve(false));
