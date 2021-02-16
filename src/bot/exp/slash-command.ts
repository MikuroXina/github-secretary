export interface ApplicationCommand {
  name: string;
  description: string;
  options: ApplicationCommandOption[];
}

export const commandIntoBody = (command: ApplicationCommand): unknown => ({
  ...command,
  options: command.options.map(optionIntoRawValue),
});

export interface ApplicationCommandOption {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

const optionIntoRawValue = (self: ApplicationCommandOption): unknown => ({
  ...self,
  type: typeIntoRawValue(self.type),
  options: self.options?.map(optionIntoRawValue),
});

export type ApplicationCommandOptionType =
  | "SUB_COMMAND"
  | "SUB_COMMAND_GROUP"
  | "STRING"
  | "INTEGER"
  | "BOOLEAN"
  | "USER"
  | "CHANNEL"
  | "ROLE";

const typeIntoRawValue = (self: ApplicationCommandOptionType): number => {
  switch (self) {
    case "SUB_COMMAND":
      // eslint-disable-next-line no-magic-numbers
      return 1;
    case "SUB_COMMAND_GROUP":
      // eslint-disable-next-line no-magic-numbers
      return 2;
    case "STRING":
      // eslint-disable-next-line no-magic-numbers
      return 3;
    case "INTEGER":
      // eslint-disable-next-line no-magic-numbers
      return 4;
    case "BOOLEAN":
      // eslint-disable-next-line no-magic-numbers
      return 5;
    case "USER":
      // eslint-disable-next-line no-magic-numbers
      return 6;
    case "CHANNEL":
      // eslint-disable-next-line no-magic-numbers
      return 7;
    case "ROLE":
      // eslint-disable-next-line no-magic-numbers
      return 8;
    default:
      throw new Error("unreachable");
  }
};

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}
