# graphql-compose-partial-update

解决graphql-compose-mongoose中无法只更新定义模型中的新传入值属性的问题


用法：
```
import { supportPartialUpdate } from 'graphql-compose-partial-update';
import { schemaComposer } from 'graphql-compose';

...

schemaComposer.Mutation.addFields({
    ...supportPartialUpdate(updateUserInfo{ : UserTC.getResolver('updateOne') }),
});
```