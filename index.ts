function isObject(item:any) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

function merge(target:any, source:any) {
    // sanity check - probably overkill
    if (!isObject(source)) {
        return source !== null ? source : undefined;
    }
    const output = target;
    const entries = Object.entries(source);
    for (let i = 0; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        if (isObject(source[key])) {
            if (target[key] === undefined) {
                // add new embedded documents
                output[key] = value;
            } else {
                // recursively merge existing embedded documents
                output[key] = merge(target[key], value);
            }
        } else {
        // remove existing fields with a `null` input
            output[key] = value !== null ? value : undefined;
        }
    }
    return output;
}

/**
 * 让graphql-compose支持局部更新新传入属性的方法
 * 
 * @param resolvers 
 * @returns 
 */
export function supportPartialUpdate(resolvers:any) {
    Object.keys(resolvers).forEach((k) => {
        resolvers[k] = resolvers[k].wrapResolve((next: any) => async (rp:any) => {
            rp.beforeRecordMutate = async (doc:any, rp:any) => {
                const entries = Object.entries(rp.args.record);
                for (let i = 0; i < entries.length; i += 1) {
                    const [key, value] = entries[i];
                    if (isObject(value) && !(value instanceof Date)) {
                        if (doc[key] === undefined) {
                            // add new embedded documents that don't exist yet
                            doc[key] = value;
                        } else {
                            // merge new embedded documents into existing ones
                            rp.args.record[key] = merge(doc[key], rp.args.record[key]);
                        }
                    } else if (value === null) {
                        // remove existing fields with a `null` input
                        rp.args.record[key] = undefined;
                    }
                }
                return doc;
            };
            return next(rp);
        });
    });
    return resolvers;
}
