import {ProcessNode} from "./ProcessNode";
import {IProcessContext} from "./IProcessContext";

export class StepBuilder<TContext extends IProcessContext>
{
  readonly stepId: string;
  title?: string;
  description?: string;
  readonly parent: CategoryBuilder<TContext>;
  root?: ProcessBuilder<TContext>;

  quant?: string;
  sideEffect?: string;
  prompt?: string;
  _isNonInteractive?: boolean;

  inputMap: { localName: string; globalName: string }[] = [];
  staticInputs: { localName: string; value: any }[] = [];
  outputMap: { localName: string; globalName: string }[] = [];
  quantData?: any;

  constructor(parent: CategoryBuilder<TContext>, stepId: string)
  {
    this.parent = parent;
    this.stepId = stepId;
  }

  withQuant(quant: string, data: any = undefined): StepBuilder<TContext>
  {
    this.quant = quant;
    this.quantData = data;
    return this;
  }

  withSideEffect<TArgument>(sideEffect: string): StepBuilder<TContext>
  {
    this.sideEffect = sideEffect;
    return this;
  }

  step(id: string): StepBuilder<TContext>
  {
    const builder = new StepBuilder(this.parent, id);
    this.parent.categoriesOrSteps.push(builder);
    builder.root = this.root;
    return builder;
  }

  withTitle(title: string): StepBuilder<TContext>
  {
    this.title = title;
    return this;
  }

  withDescription(description: string): StepBuilder<TContext>
  {
    this.description = description;
    return this;
  }

  withPrompt(prompt: string): StepBuilder<TContext>
  {
    this.prompt = prompt;
    return this;
  }

  build(parent: ProcessNode<TContext>): ProcessNode<TContext>
  {
    const step = new ProcessNode<TContext>(parent);
    step.quant = this.quant;
    step.sideEffect = this.sideEffect;
    step.stepId = this.stepId;
    step.title = this.title;
    step.description = this.description;
    step.prompt = this.prompt;
    step.inputMap = this.inputMap;
    step.staticInputs = this.staticInputs;
    step.outputMap = this.outputMap;
    step.isInteractive = !!this.quant && !this._isNonInteractive;
    step.quantData = this.quantData;
    return step;
  }

  mapOutput(localName: string, globalName: string): StepBuilder<TContext>
  {
    this.outputMap.push({
      localName: localName,
      globalName: globalName
    });
    return this;
  }

  mapInput(localName: string, globalName: string): StepBuilder<TContext>
  {
    this.inputMap.push({
      localName: localName,
      globalName: globalName
    });
    return this;
  }

  withStaticInput(localName: string, value: any): StepBuilder<TContext>
  {
    this.staticInputs.push({
      localName: localName,
      value: value
    });
    return this;
  }

  isNonInteractive(): StepBuilder<TContext>
  {
    this._isNonInteractive = true;
    return this;
  }
}

export class CategoryBuilder<TContext extends IProcessContext>
{
  readonly parent?: CategoryBuilder<TContext>;
  readonly title: string;

  quant?: string;

  readonly categoriesOrSteps: (CategoryBuilder<TContext> | StepBuilder<TContext>)[] = [];
  root: ProcessBuilder<TContext>;

  constructor(title: string, root: ProcessBuilder<TContext>, parent?: CategoryBuilder<TContext>)
  {
    this.root = root;
    this.parent = parent;
    this.title = title;
  }

  category(title: string, nestedBuilder: (b: CategoryBuilder<TContext>) => void): CategoryBuilder<TContext>
  {
    const builder = new CategoryBuilder(title, this.root, this);
    this.categoriesOrSteps.push(builder);
    nestedBuilder(builder);
    return builder;
  }

  withQuant(quant: string): CategoryBuilder<TContext>
  {
    this.quant = quant;
    return this;
  }

  step(id: string): StepBuilder<TContext>
  {
    const builder = new StepBuilder(this, id);
    builder.root = this.root;
    this.categoriesOrSteps.push(builder);
    return builder;
  }

  build(parent: ProcessNode<TContext>): ProcessNode<TContext>
  {
    const category = new ProcessNode<TContext>(parent);
    category.title = this.title;
    category.quant = this.quant;

    for (let item of this.categoriesOrSteps)
    {
      if (item instanceof CategoryBuilder)
      {
        category.children.push(item.build(category));
      }
      else if (item instanceof StepBuilder)
      {
        category.children.push(item.build(category));
      }
    }

    return category;
  }

  end(): ProcessBuilder<TContext>
  {
    return this.root;
  }
}

export class ProcessBuilder<TContext extends IProcessContext>
{
  readonly categories: CategoryBuilder<TContext>[] = [];

  readonly id: string;

  constructor(id: string)
  {
    this.id = id;
  }

  category(title: string, nestedBuilder: (b: CategoryBuilder<TContext>) => void): CategoryBuilder<TContext>
  {
    const builder = new CategoryBuilder<TContext>(title, this);
    builder.root = this;
    this.categories.push(builder);
    nestedBuilder(builder);
    return builder;
  }

  build(): ProcessNode<TContext>
  {
    const processNode = new ProcessNode<TContext>();

    for (let item of this.categories)
    {
      processNode.children.push(item.build(processNode));
    }

    const stack = [processNode];
    while (stack.length > 0)
    {
      const item = stack.pop();
      if (!item)
        continue;
      item.parent = null;
      item.children.forEach(o => stack.push(o));
    }

    return processNode;
  }
}
