/* */ 
System.register(['typescript', './logger', './compiler-host', './transpiler', './resolver', './type-checker', './format-errors', "./utils"], function(exports_1) {
    var ts, logger_1, compiler_host_1, transpiler_1, resolver_1, type_checker_1, format_errors_1, utils_1;
    var logger;
    function createFactory(sjsconfig, _resolve, _fetch) {
        if (sjsconfig === void 0) { sjsconfig = {}; }
        var tsconfigFiles = [];
        var typingsFiles = [];
        return loadOptions(sjsconfig, _resolve, _fetch)
            .then(function (options) {
            return createServices(options, _resolve, _fetch);
        })
            .then(function (services) {
            if (services.options.typeCheck) {
                return resolveDeclarationFiles(services.options, _resolve)
                    .then(function (resolvedFiles) {
                    resolvedFiles.forEach(function (resolvedFile) {
                        services.resolver.registerDeclarationFile(resolvedFile, false);
                    });
                    return services;
                });
            }
            else {
                return services;
            }
        });
    }
    exports_1("createFactory", createFactory);
    function loadOptions(sjsconfig, _resolve, _fetch) {
        if (sjsconfig.tsconfig) {
            var tsconfig = (sjsconfig.tsconfig === true) ? "tsconfig.json" : sjsconfig.tsconfig;
            return _resolve(tsconfig)
                .then(function (tsconfigAddress) {
                return _fetch(tsconfigAddress).then(function (tsconfigText) { return ({ tsconfigText: tsconfigText, tsconfigAddress: tsconfigAddress }); });
            })
                .then(function (_a) {
                var tsconfigAddress = _a.tsconfigAddress, tsconfigText = _a.tsconfigText;
                var ts1 = ts;
                var result = ts1.parseConfigFileText ?
                    ts1.parseConfigFileText(tsconfigAddress, tsconfigText) :
                    ts1.parseConfigFileTextToJson(tsconfigAddress, tsconfigText);
                if (result.error) {
                    format_errors_1.formatErrors([result.error], logger);
                    throw new Error("failed to load tsconfig from " + tsconfigAddress);
                }
                var files = result.config.files;
                return ts.extend(ts.extend({ tsconfigAddress: tsconfigAddress, files: files }, sjsconfig), result.config.compilerOptions);
            });
        }
        else {
            return Promise.resolve(sjsconfig);
        }
    }
    function resolveDeclarationFiles(options, _resolve) {
        var files = options.files || [];
        var declarationFiles = files
            .filter(function (filename) { return utils_1.isTypescriptDeclaration(filename); })
            .map(function (filename) { return _resolve(filename, options.tsconfigAddress); });
        return Promise.all(declarationFiles);
    }
    function createServices(options, _resolve, _fetch) {
        var host = new compiler_host_1.CompilerHost(options);
        var transpiler = new transpiler_1.Transpiler(host);
        var resolver = undefined;
        var typeChecker = undefined;
        if (options.typeCheck) {
            resolver = new resolver_1.Resolver(host, _resolve, _fetch);
            typeChecker = new type_checker_1.TypeChecker(host);
            if (!host.options.noLib) {
                return _resolve('ts', '')
                    .then(function (moduleName) {
                    return _resolve(host.getDefaultLibFileName(), moduleName);
                })
                    .then(function (defaultLibAddress) {
                    resolver.registerDeclarationFile(defaultLibAddress, true);
                    return { host: host, transpiler: transpiler, resolver: resolver, typeChecker: typeChecker, options: options };
                });
            }
        }
        return Promise.resolve({ host: host, transpiler: transpiler, resolver: resolver, typeChecker: typeChecker, options: options });
    }
    return {
        setters:[
            function (ts_1) {
                ts = ts_1;
            },
            function (logger_1_1) {
                logger_1 = logger_1_1;
            },
            function (compiler_host_1_1) {
                compiler_host_1 = compiler_host_1_1;
            },
            function (transpiler_1_1) {
                transpiler_1 = transpiler_1_1;
            },
            function (resolver_1_1) {
                resolver_1 = resolver_1_1;
            },
            function (type_checker_1_1) {
                type_checker_1 = type_checker_1_1;
            },
            function (format_errors_1_1) {
                format_errors_1 = format_errors_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            logger = new logger_1.default({ debug: false });
        }
    }
});
