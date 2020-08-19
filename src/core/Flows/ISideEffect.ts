import {IProcessContext} from "./IProcessContext";

export interface ISideEffect<IContext extends IProcessContext, TArgument>
{
  _$schemaId: string;
  inputs?: { name: string, type: string, description?: string }[];
  outputs?: { name: string, type: string, description?: string }[];

  execute?: (context: IContext, argument: TArgument) => Promise<void>;

  /**
   * Checks if the action can be executed in the given environment (defined by the context).
   * @param context The environment.
   */
  canExecute?: (context: IContext, argument: TArgument) => Promise<boolean>;
}
