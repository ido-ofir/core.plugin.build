module.exports = {
    name: 'core.plugin.build',
    dependecies: [
        'core.plugin.type'
    ],
    extend: {
        build(source, done) {

            var core = this;

            if (!source) { return source; }

            var typeName = source['$_type'];

            if (!typeName) {
                if(core.isArray(source)){
                    return source.map(t => core.build(t));
                }
                if(core.isObject(source)){
                    return core.assign({}, source, function(property, key, source){
                        return core.build(property);
                    });
                }
                return source;
            }

            var parent = null;
            var result = source;
            var type = core.types[typeName];

            if (!type) throw new Error(`cannot find type '${typeName}'`);
            if(!type.build){ return type; }

            if(type.extends){
                parent = core.types[type.extends];
                if(!parent){
                    throw new Error(`cannot find type '${type.extends}', '${ typeName }' tries to extend it.`);
                }
            }

            return type.build.call(core, result, function(built, done){
                if(!parent){ 
                    return built; 
                }
                return core.build(core.assign({}, built, { $_type: parent.name }), done);
            }, done);

        }
    }
};