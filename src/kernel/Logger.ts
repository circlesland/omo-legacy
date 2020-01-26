/**
 * The Logger overrides the console outputs and the clear. All stuff logged by any JS framework will be in the observable logs array
 * Components can use this Logger then bringing the logs to the front. of course this logger can be extended to show more detailed information.
 */
export default class Logger {
    logs: [any]
    /**
     * Creates the logger
     */
    constructor() {
        this.logs = [0];
        this.overwriteConsoleOutput();
        this.overwriteConsoleFunctions();
    }

    /**
     * Add the log to the ObservableArray and return back the type
     * @param  {The logtype of object} type
     * @param  {The arguments that was logged} args
     */
    log(type:string, args:any) {
        if (args) args.logtype = type;
        this.logs.push(args);
        return type;
    }

    /**
     * @param  {} context the object you want to overwrite
     * @param  {} method The method to overwrite
     * @param  {} type the logtype
     * @param  {} log the replacing function
     */
    proxy(context:any, method:any, type:string, log:any) {
        var THIS = this;
        return function () {
            if (type == "CLEAR") {
                THIS.logs = [0];
                method.apply(context, Array.prototype.slice.apply(arguments))
            }
            else {
                method.apply(context, [log(type, arguments) + ": "].concat(Array.prototype.slice.apply(arguments)))
            }
        }
    }

    overwriteConsoleFunctions() {
        console.clear = this.proxy(console, console.clear, "CLEAR", null);
    }

    overwriteConsoleOutput() {
        console.log = this.proxy(console, console.log, "LOG", this.log.bind(this));
        console.error = this.proxy(console, console.error, "ERROR", this.log.bind(this));
        console.warn = this.proxy(console, console.warn, "WARNING", this.log.bind(this))
        console.info = this.proxy(console, console.info, "INFO", this.log.bind(this))
        console.assert = this.proxy(console, console.assert, "ASSERT", this.log.bind(this))
        console.debug = this.proxy(console, console.assert, "DEBUG", this.log.bind(this))
    }
}