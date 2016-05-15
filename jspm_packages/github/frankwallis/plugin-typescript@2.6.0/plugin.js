/* */ 
System.register(['typescript', './logger', './factory', './format-errors', './utils'], function(exports_1) {
    var ts, logger_1, factory_1, format_errors_1, utils_1;
    var logger, factory;
    function translate(load) {
        var _this = this;
        logger.debug("systemjs translating " + load.address);
        return factory.then(function (_a) {
            var transpiler = _a.transpiler, resolver = _a.resolver, typeChecker = _a.typeChecker, host = _a.host;
            host.addFile(load.address, load.source);
            if (utils_1.isTypescriptDeclaration(load.address)) {
                load.source = "";
            }
            else {
                var result = transpiler.transpile(load.address);
                format_errors_1.formatErrors(result.errors, logger);
                if (result.failure)
                    throw new Error("TypeScript transpilation failed");
                if (_this.loader && (host.options.module === 4))
                    load.source = wrapSource(result.js, load);
                else
                    load.source = result.js;
                if (result.sourceMap)
                    load.metadata.sourceMap = JSON.parse(result.sourceMap);
                if (host.options.module === 4)
                    load.metadata.format = 'register';
                else if (host.options.module === 5)
                    load.metadata.format = 'esm';
                else if (host.options.module === 1)
                    load.metadata.format = 'cjs';
            }
            if (host.options.typeCheck && utils_1.isTypescript(load.address)) {
                return resolver.resolve(load.address)
                    .then(function (deps) {
                    var diags = typeChecker.check();
                    format_errors_1.formatErrors(diags, logger);
                    deps.list
                        .filter(utils_1.isTypescriptDeclaration)
                        .forEach(function (d) { return System.import(d + "!"); });
                    return load.source;
                });
            }
            else {
                return load.source;
            }
        });
    }
    exports_1("translate", translate);
    function bundle() {
        return factory.then(function (_a) {
            var typeChecker = _a.typeChecker, host = _a.host;
            if (host.options.typeCheck) {
                var errors = typeChecker.forceCheck();
                if (errors.length > 0) {
                    format_errors_1.formatErrors(errors, logger);
                    if (host.options.typeCheck === "strict")
                        throw new Error("Typescript compilation failed");
                }
            }
            return [];
        });
    }
    exports_1("bundle", bundle);
    function validateOptions(options) {
        if (options.module != 4) {
            if ((!System.transpiler || System.transpiler.indexOf("babel") < 0) || (options.target != 2))
                logger.warn("transpiling to " + ts.ModuleKind[options.module] + ", consider setting module: \"system\" in typescriptOptions to transpile directly to System.register format");
        }
    }
    function wrapSource(source, load) {
        return '(function(__moduleName){' + source + '\n})("' + load.name + '");\n//# sourceURL=' + load.address + '!transpiled';
    }
    function _resolve(dep, parent) {
        return System.normalize(dep, parent)
            .then(function (normalized) {
            normalized = utils_1.stripDoubleExtension(normalized);
            logger.debug("resolved " + normalized + " (" + parent + " -> " + dep + ")");
            return ts.normalizePath(normalized);
        });
    }
    function _fetch(address) {
        return System.fetch({ address: address, name: address, metadata: {} })
            .then(function (text) {
            logger.debug("fetched " + address);
            return text;
        });
    }
    return {
        setters:[
            function (ts_1) {
                ts = ts_1;
            },
            function (logger_1_1) {
                logger_1 = logger_1_1;
            },
            function (factory_1_1) {
                factory_1 = factory_1_1;
            },
            function (format_errors_1_1) {
                format_errors_1 = format_errors_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            logger = new logger_1.default({ debug: false });
            factory = factory_1.createFactory(System.typescriptOptions, _resolve, _fetch)
                .then(function (output) {
                validateOptions(output.host.options);
                return output;
            });
        }
    }
});
