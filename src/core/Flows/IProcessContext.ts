import {Quantum} from "../Quantum";

/**
 * Must be supplied to every action of a IProcessNode.
 */
export interface IProcessContext
{
  stepId: string;
  o: Quantum;

  inputs: { name: string, value: any }[];
  outputs: { name: string, value: any }[];

  [others: string]: any;
}
