
# JavaScript 与 JSON

本笔记是在学习 MongoDB 的记录笔记，持续补充中，在学习的过程中参考了下面的教程。想要继续学习的朋友可以根据链接找到更多的内容：

[MongoDB 教程 | 菜鸟教程](http://www.runoob.com/mongodb/mongodb-tutorial.html)
[mongoDB入门篇](http://www.imooc.com/learn/295)
[MongoDB权威指南](https://book.douban.com/subject/25798102/)

<!--more-->

## RDBMS 和 NoSQL

### 关系型数据库遵循ACID规则

#### A (Atomicity) 原子性

原子性很容易理解，也就是说事务里的所有操作要么全部做完，要么都不做，事务成功的条件是事务里的所有操作都成功，只要有一个操作失败，整个事务就失败，需要回滚。

比如银行转账，从A账户转100元至B账户，分为两个步骤：1）从A账户取100元；2）存入100元至B账户。这两步要么一起完成，要么一起不完成，如果只完成第一步，第二步失败，钱会莫名其妙少了100元。

#### C (Consistency) 一致性

一致性也比较容易理解，也就是说数据库要一直处于一致的状态，事务的运行不会改变数据库原本的一致性约束。

例如现有完整性约束a+b=10，如果一个事务改变了a，那么必须得改变b，使得事务结束后依然满足a+b=10，否则事务失败。

#### I (Isolation) 独立性

所谓的独立性是指并发的事务之间不会互相影响，如果一个事务要访问的数据正在被另外一个事务修改，只要另外一个事务未提交，它所访问的数据就不受未提交事务的影响。

比如现有有个交易是从A账户转100元至B账户，在这个交易还未完成的情况下，如果此时B查询自己的账户，是看不到新增加的100元的。

#### D (Durability) 持久性

持久性是指一旦事务提交后，它所做的修改将会永久的保存在数据库上，即使出现宕机也不会丢失。

### NoSQL

NoSQL，指的是非关系型的数据库。NoSQL有时也称作Not Only SQL的缩写，是对不同于传统的关系型数据库的数据库管理系统的统称。

**NoSQL用于超大规模数据的存储**。（例如谷歌或Facebook每天为他们的用户收集万亿比特的数据）。这些类型的数据存储不需要固定的模式，无需多余操作就可以**横向扩展**。

### RDBMS vs NoSQL

RDBMS 
1. 高度组织化结构化数据 
2. 结构化查询语言（SQL） (SQL) 
3. 数据和关系都存储在单独的表中。 
4. 数据操纵语言，数据定义语言 
5. 严格的一致性
6. 基础事务

NoSQL 
1. 代表着不仅仅是SQL
2. 没有声明性查询语言
3. 没有预定义的模式
4. 键 - 值对存储，列存储，文档存储，图形数据库
5. 最终一致性，而非ACID属性
6. 非结构化和不可预知的数据
7. CAP定理 
8. 高性能，高可用性和可伸缩性

![](http://www.runoob.com/wp-content/uploads/2013/10/bigdata.png)

由上图可以知道，网络中出现的非结构化的数据越来越多，不同种类的数据类型也越来越多，所以使用 NoSQL 可以更好地处理这些非结构化的数据。

### CAP定理（CAP theorem）

在计算机科学中, CAP定理（CAP theorem）, 又被称作 布鲁尔定理（Brewer's theorem）, 它指出对于一个分布式计算系统来说，不可能同时满足以下三点:

1. 一致性(Consistency) (所有节点在同一时间具有相同的数据)
2. 可用性(Availability) (保证每个请求不管成功或者失败都有响应)
3. 分隔容忍(Partition tolerance) (系统中任意信息的丢失或失败不会影响系统的继续运作)

因此，根据 CAP 原理将 NoSQL 数据库分成了满足 CA 原则、满足 CP 原则和满足 AP 原则三 大类：

1. CA - 单点集群，满足一致性，可用性的系统，通常在可扩展性上不太强大。
2. CP - 满足一致性，分区容忍性的系统，通常性能不是特别高。
3. AP - 满足可用性，分区容忍性的系统，通常可能对一致性要求低一些。

BASE是NoSQL数据库通常对可用性及一致性的弱要求原则:

1. Basically Availble --基本可用
2. Soft-state --软状态/柔性事务。
3. Eventual Consistency --最终一致性 最终一致性， 也是是 ACID 的最终目的。

### NoSQL 数据库分类

```
列存储	:
Hbase
Cassandra
Hypertable
顾名思义，是按列存储数据的。最大的特点是方便存储结构化和半结构化数据，方便做数据压缩，对针对某一列或者某几列的查询有非常大的IO优势。

文档存储 :
MongoDB
CouchDB
文档存储一般用类似json的格式存储，存储的内容是文档型的。这样也就有有机会对某些字段建立索引，实现关系数据库的某些功能。

key-value存储 :
Tokyo Cabinet / Tyrant
Berkeley DB
MemcacheDB
Redis
可以通过key快速查询到其value。一般来说，存储不管value的格式，照单全收。（Redis包含了其他功能）

图存储 :
Neo4J
FlockDB
图形关系的最佳存储。使用传统关系数据库来解决的话性能低下，而且设计使用不方便。

对象存储 :
db4o
Versant
通过类似面向对象语言的语法操作数据库，通过对象的方式存取数据。

xml数据库 :
Berkeley DB XML
BaseX
高效的存储XML数据，并支持XML的内部查询语法，比如XQuery,Xpath。
```

## MongoDB 概念解析

```
SQL术语/概念	MongoDB术语/概念	解释/说明
database	      database	      数据库
table	         collection	    数据库表/集合
row	              document	   数据记录行/文档
column	           field	    数据字段/域
index	           index	      索引
table              joins	表连接,MongoDB不支持
primary key	    primary key	主键,MongoDB自动将_id字段设置为主键
```

MongoDB 中的数据类型

MongoDB区分类型和大小写。

```
数据类型	                      描述
String	      字符串。存储数据常用的数据类型。在 MongoDB 中，UTF-8 编码的字符串才是合法的。
Integer	      整型数值。用于存储数值。根据你所采用的服务器，可分为 32 位或 64 位。
Boolean	      布尔值。用于存储布尔值（真/假）。
Double	      双精度浮点值。用于存储浮点值。
Min/Max keys  将一个值与 BSON（二进制的 JSON）元素的最低值和最高值相对比。
Arrays	      用于将数组或列表或多个值存储为一个键。
Timestamp	  时间戳。记录文档修改或添加的具体时间。
Object	      用于内嵌文档。
Null	      用于创建空值。
Symbol	      符号。该数据类型基本上等同于字符串类型，但不同的是，它一般用于采用特殊符号类型的语言。
Date	      日期时间。用 UNIX 时间格式来存储当前日期或时间。你可以指定自己的日期时间：创建 Date 对象，传入年月日信息。
Object ID	  对象 ID。用于创建文档的 ID。
Binary Data	  二进制数据。用于存储二进制数据。
Code	      代码类型。用于在文档中存储 JavaScript 代码。
Regular expression	正则表达式类型。用于存储正则表达式。
```

有一些数据库名是保留的，可以直接访问这些有特殊作用的数据库。

1. admin： 从权限的角度来看，这是"root"数据库。要是将一个用户添加到这个数据库，这个用户自动继承所有数据库的权限。一些特定的服务器端命令也只能从这个数据库运行，比如列出所有的数据库或者关闭服务器。
2. local: 这个数据永远不会被复制，可以用来存储限于本地单台服务器的任意集合
3. config: 当Mongo用于分片设置时，config数据库在内部使用，用于保存分片的相关信息。

## 数据库

**创建数据库**

```
use DATABASE_NAME
```

如果数据库不存在，则创建数据库，否则切换到指定数据库。

**查看当前数据库**

```
> db
  zyc
```

**查看所有数据库**

如果你想查看所有数据库，可以使用 show dbs 命令：

```
show dbs
```

可以看到，我们刚创建的数据库 zyc 并不在数据库的列表中， 要显示它，我们需要向 zyc 数据库插入一些数据。

```
> show dbs
  admin  0.000GB
  local  0.000GB
> db
  zyc
> db.zyc.insert({'id': 'BUPT'})
  WriteResult({ "nInserted" : 1 })
> show dbs
  admin  0.000GB
  local  0.000GB
  zyc    0.000GB
```

MongoDB 中默认的数据库为 test，如果你没有创建新的数据库，集合将存放在 test 数据库中。

**删除数据库**

MongoDB 删除数据库的语法格式如下：

```
db.dropDatabase()
```

删除当前数据库，默认为 test，你可以使用 db 命令查看当前数据库名。

```
> db.dropDatabase()
  { "dropped" : "zyc", "ok" : 1 }
```

## 集合 

集合的概念就和 RDBMS 中的 table 是一个概念

**给集合插入数据**

使用 [collection].insert() 来插入数据，如果该集合不存在，则会创建。

```
> db.mongo.insert({'id': 'first mongodb collection'})
  WriteResult({ "nInserted" : 1 })
> show tables;
  mongo
```

**查看所有的集合**

```
> show tables;
  mongo
```

**删除集合**

```
> db.mongo.drop()
  true
> show tables;
  
```

## 文档

文档的数据结构和JSON基本一样。
所有存储在集合中的数据都是BSON格式。
BSON是一种类json的一种二进制形式的存储格式,简称Binary JSON。

### 插入文档

MongoDB 使用 insert() 或 save() 方法向集合中插入文档，语法如下：

```
db.COLLECTION_NAME.insert(document)
```

插入文档的数据，必须要是一个 `document`，也就是一个有 key-value 对的 `{}`。如果 key-value 对中没有 '_id' 存在，则会默认生成一个 `ObjectId` 类型的键值对，用来表示这个文档。

比如：

```
> db.mongo.insert({'id': 'first mongodb collection'})
  WriteResult({ "nInserted" : 1 })
> db.mongo.find()
  { "_id" : ObjectId("58d22b9f123c0b38c9226ad7"), "id" : "first mongodb collection" }
```

insert 和 save 的区别：

通过在 mongodb 中执行 `db.COLLECTION_NAME.insert` 和 `db.COLLECTION_NAME.save`，可以通过返回值得到这个函数的逻辑。

```
> db.mongo.save
function (obj, opts) {
    if (obj == null)
        throw Error("can't save a null");

    if (typeof(obj) == "number" || typeof(obj) == "string")
        throw Error("can't save a number or string");

    if (typeof(obj._id) == "undefined") {
        obj._id = new ObjectId();
        return this.insert(obj, opts);
    } else {
        return this.update({_id: obj._id}, obj, Object.merge({upsert: true}, opts));
    }
}
```

我们可以看到，`save` 无法保存 null、number、string，当然 insert 也无法保存这几种数据类型。

通过 `save` 的逻辑中可以看出，如果这个 `obj` 没有在集合中存过，则调用 `insert` 方法将这个文档存入。如果在集合中已经存在了这个文档，则进行 `update` 更新文档。

我们也可以将数据定义为一个变量，如下所示：

```
> document=({title: 'MongoDB 教程', 
    description: 'MongoDB 是一个 Nosql 数据库',
    by: '菜鸟教程',
    url: 'http://www.runoob.com',
    tags: ['mongodb', 'database', 'NoSQL'],
    likes: 100
});
```

执行插入操作：

```
> db.col.insert(document)
  WriteResult({ "nInserted" : 1 })
```


### 查找集合中所有的文档

```
db.COLLECTION_NAME.find()
```

将返回集合中所有的元素。

也可以在 `find()` 的返回值中调用 `pretty()` 方法，将优化 Shell 输出样式：

```
> db.mongo.find().pretty()
{
	"_id" : ObjectId("58d22b9f123c0b38c9226ad7"),
	"id" : "first mongodb collection"
}
```

可以通过**条件操作符**来选择查询的条件

MongoDB中条件操作符有：

1. (>) 大于 - `$gt`
2. (<) 小于 - `$lt`
3. (>=) 大于等于 - `$gte`
4. (<= ) 小于等于 - `$lte`

![](http://ojt6zsxg2.bkt.clouddn.com/a6683c803916e1270d6de367203b4cfb.png)

**MongoDB AND 条件**

MongoDB 的 find() 方法可以传入多个键(key)，每个键(key)以逗号隔开，及常规 SQL 的 AND 条件。
语法格式如下：

```
>db.col.find({key1:value1, key2:value2}).pretty()
```

**MongoDB OR 条件**

MongoDB OR 条件语句使用了关键字 `$or`,语法格式如下：

```
>db.col.find(
   {
      $or: [
	     {key1: value1}, {key2:value2}
      ]
   }
).pretty()
```

以下实例演示了 AND 和 OR 联合使用，类似常规 SQL 语句为： `where likes>50 AND (by = '菜鸟教程' OR title = 'MongoDB 教程')`

```
db.col.find({"likes": {$gt:50}, $or: [{"by": "菜鸟教程"},{"title": "MongoDB 教程"}]}).pretty()
```

`$type`操作符是基于BSON类型来检索集合中匹配的数据类型，并返回结果。

如果想获取 "col" 集合中 title 为 String 的数据，你可以使用以下命令：

```
db.col.find({"title" : {$type : 2}})
```

其中 2 对应着 String 类型。所有的类型对应表如下：

![](http://ojt6zsxg2.bkt.clouddn.com/15dfa8ac27f02a4b5efda5e4c39cfe34.png)
![](http://ojt6zsxg2.bkt.clouddn.com/a2e8a8faf1a641b9f7a68d1155063f77.png)

#### 读取指定数量的数据记录

如果你需要在MongoDB中读取指定数量的数据记录，可以使用MongoDB的Limit方法，`limit()`方法接受一个数字参数，该参数指定从MongoDB中读取的记录条数。

```
>db.COLLECTION_NAME.find().limit(NUMBER)
```

我们除了可以使用`limit()`方法来读取指定数量的数据外，还可以使用`skip()`方法来跳过指定数量的数据，skip方法同样接受一个数字参数作为跳过的记录条数。

`skip()`方法脚本语法格式如下：

```
>db.COLLECTION_NAME.find().limit(NUMBER).skip(NUMBER)
```

#### 查找结果排序

在MongoDB中使用`sort()`方法对数据进行排序，`sort()`方法可以通过参数指定排序的字段，并使用 `1` 和 `-1` 来指定排序的方式，其中 `1` 为升序排列，而`-1`是用于降序排列。

```
>db.COLLECTION_NAME.find().sort({KEY:1})
```

### 删除集合中的文档

```
db.collection.remove(
   <query>,
   {
     justOne: <boolean>,
     writeConcern: <document>
   }
)
```

参数说明：

* `query` :（可选）删除的文档的条件。
* `justOne` : （可选）如果设为 true 或 1，则只删除一个文档。
* `writeConcern` :（可选）抛出异常的级别。

```
db.col.remove({'title':'MongoDB 教程'})
```


### 更新集合中的文档

`update()` 方法用于更新已存在的文档。语法格式如下：

```
db.collection.update(
   <query>,
   <update>,
   {
     upsert: <boolean>,
     multi: <boolean>,
     writeConcern: <document>
   }
)
```

参数说明：

* `query` : update的查询条件，类似sql update查询内`where`后面的。
* `update` : update的对象和一些更新的操作符（如`$,$inc...`）等，也可以理解为sql update查询内`set`后面的
* `upsert` : 可选，这个参数的意思是，如果不存在update的记录，是否插入objNew，`true`为插入，默认是`false`，不插入。
* `multi` : 可选，mongodb 默认是`false`，只更新找到的第一条记录，如果这个参数为`true`，就把按条件查出来多条记录全部更新。
* `writeConcern` :可选，抛出异常的级别。

### MongoDB 原子操作

mongodb不支持事务，所以，在你的项目中应用时，要注意这点。无论什么设计，都不要要求mongodb保证数据的完整性。

但是mongodb提供了许多原子操作，比如文档的保存，修改，删除等，都是原子操作。

所谓原子操作就是要么这个文档保存到Mongodb，要么没有保存到Mongodb，不会出现查询到的文档没有保存完整的情况。

#### $set

用来指定一个键并更新键值，若键不存在并创建。

```
{ $set : { field : value } }
```

#### $unset

用来删除一个键。

```
{ $unset : { field : 1} }
```

#### $inc

$inc可以对文档的某个值为数字型（只能为满足要求的数字）的键进行增减的操作。

```
{ $inc : { field : value } }
```

#### $push

把value追加到field里面去，field一定要是**数组类型**才行，如果field不存在，会**新增一个数组类型**加进去。

```
{ $push : { field : value } }
```

#### $pushAll

同$push,只是一次可以追加多个值到一个数组字段内。

```
{ $pushAll : { field : value_array } }
```

#### $pull

从数组field内删除一个等于value值。

```
{ $pull : { field : _value } }
```

#### $addToSet

增加一个值到数组内，而且只有当这个值不在数组内才增加。

#### $pop

删除数组的第一个或最后一个元素

```
{ $pop : { field : 1 } }
```

#### $rename

修改字段名称

```
{ $rename : { old_field_name : new_field_name } }
```

#### $bit

位操作，integer类型

```
{$bit : { field : {and : 5}}}
```

### 索引

索引通常能够极大的提高查询的效率，如果没有索引，MongoDB在读取数据时必须扫描集合中的每个文件并选取那些符合查询条件的记录。
这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可以要花费几十秒甚至几分钟，这对网站的性能是非常致命的。

索引是特殊的数据结构，索引存储在一个易于遍历读取的数据集合中，索引是对数据库表中一列或多列的值进行排序的一种结构


MongoDB使用 ensureIndex() 方法来创建索引。

ensureIndex()方法基本语法格式如下所示：

```
>db.COLLECTION_NAME.ensureIndex({KEY:1})
```

语法中 Key 值为你要创建的索引字段，1为指定按升序创建索引，如果你想按降序来创建索引指定为-1即可。

![](http://ojt6zsxg2.bkt.clouddn.com/d3dc9ecbb3587aeeb71b66fa8ba3bcd2.png)

#### 额外开销

每个索引占据一定的存储空间，在进行插入，更新和删除操作时也需要对索引进行操作。所以，如果你很少对集合进行读取操作，建议不使用索引。

#### 内存(RAM)使用

由于索引是存储在内存(RAM)中,你应该确保该索引的大小不超过内存的限制。
如果索引的大小大于内存的限制，MongoDB会删除一些索引，这将导致性能下降。

### 聚合

MongoDB中聚合(aggregate)主要用于处理数据(诸如**统计平均值,求和**等)，并返回计算后的数据结果。有点类似sql语句中的 count(*)。

aggregate() 方法的基本语法格式如下所示：

```
>db.COLLECTION_NAME.aggregate(AGGREGATE_OPERATION)
```

举例

```
> db.mycol.aggregate([{$group : {_id : "$by_user", num_tutorial : {$sum : 1}}}])
```

以上实例类似sql语句： select by_user, count(*) from mycol group by by_user

在上面的例子中，我们通过字段by_user字段对数据进行分组，并计算by_user字段相同值的总和。

下表展示了一些聚合的表达式:

![](http://ojt6zsxg2.bkt.clouddn.com/99f7868e143b47f881a7f739dd4d3439.png)

### 管道

管道在Unix和Linux中一般用于将当前命令的输出结果作为下一个命令的参数。

MongoDB的聚合管道将MongoDB文档在一个管道处理完毕后将结果传递给下一个管道处理。管道操作是可以重复的。

![](http://ojt6zsxg2.bkt.clouddn.com/1afea3cbecb79b7bc1ded80547f119b2.png)

## MongoDB 数据库引用

DBRef的形式：

```
{ $ref : , $id : , $db :  }
```

三个字段表示的意义为：

* $ref：集合名称
* $id：引用的id
* $db：数据库名称，可选参数

考虑这样的一个场景，我们在不同的集合中 (address_home, address_office, address_mailing, 等)存储不同的地址（住址，办公室地址，邮件地址等）。

这样，我们在调用不同地址时，也需要指定集合，一个文档从多个集合引用文档，我们应该使用 DBRefs。

以下实例中用户数据文档使用了 DBRef, 字段 address：

```
{
   "_id":ObjectId("53402597d852426020000002"),
   "address": {
   "$ref": "address_home",
   "$id": ObjectId("534009e4d852427820000002"),
   "$db": "w3cschoolcc"},
   "contact": "987654321",
   "dob": "01-01-1991",
   "name": "Tom Benzamin"
}
```

address DBRef 字段指定了引用的地址文档是在 address_home 集合下的 w3cschoolcc 数据库，id 为 534009e4d852427820000002。

以下代码中，我们通过指定 $ref 参数（address_home 集合）来查找集合中指定id的用户地址信息：

```
>var user = db.users.findOne({"name":"Tom Benzamin"})
>var dbRef = user.address
>db[dbRef.$ref].findOne({"_id":(dbRef.$id)})
```

## MongoDB ObjectId

ObjectId 是一个12字节 BSON 类型数据，有以下格式：

* 前4个字节表示时间戳
* 接下来的3个字节是机器标识码
* 紧接的两个字节由进程id组成（PID）
* 最后三个字节是随机数。

### 创建文档的时间戳

由于 ObjectId 中存储了 4 个字节的时间戳，所以你不需要为你的文档保存时间戳字段，你可以通过 `getTimestamp` 函数来获取文档的创建时间:

```
>ObjectId("5349b4ddd2781d08c09890f4").getTimestamp()
```

以上代码将返回 ISO 格式的文档创建时间：

```
ISODate("2014-04-12T21:49:17Z")
```

### ObjectId 转换为字符串

在某些情况下，您可能需要将ObjectId转换为字符串格式。你可以使用下面的代码：

```
>new ObjectId().str
```

以上代码将返回Guid格式的字符串：：

```
5349b4ddd2781d08c09890f3
```

## MongoDB GridFS

GridFS 用于存储和恢复那些超过16M（BSON文件限制）的文件(如：图片、音频、视频等)。

GridFS 也是文件存储的一种方式，但是它是存储在MonoDB的集合中。
GridFS 可以更好的存储大于16M的文件。

GridFS 会将大文件对象分割成多个小的chunk(文件片段),一般为256k/个,每个chunk将作为MongoDB的一个文档(document)被存储在chunks集合中。

GridFS 用两个集合来存储一个文件：fs.files与fs.chunks。

每个文件的实际内容被存在chunks(二进制数据)中,和文件有关的meta数据(filename,content_type,还有用户自定义的属性)将会被存在files集合中。

## MongoDB 固定集合（Capped Collections）

MongoDB 固定集合（Capped Collections）是性能出色且有着固定大小的集合，对于大小固定，我们可以想象其就像一个环形队列，当集合空间用完后，再插入的元素就会覆盖最初始的头部的元素！

指定文档个数,加上max:1000属性：

```
>db.createCollection("cappedLogCollection",{capped:true,size:10000,max:1000})
```

**固定集合属性及用法**

属性

1. 属性1:对固定集合进行插入速度极快
2. 属性2:按照插入顺序的查询输出速度极快
3. 属性3:能够在插入最新数据时,淘汰最早的数据

用法

1. 用法1:储存日志信息
2. 用法2:缓存一些少量的文档

## MongoDB 自动增长

MongoDB 没有像 SQL 一样有自动增长的功能， MongoDB 的 _id 是系统自动生成的12字节唯一标识。

但在某些情况下，我们可能需要实现 ObjectId 自动增长功能。

由于 MongoDB 没有实现这个功能，我们可以通过编程的方式来实现，以下我们将在 counters 集合中实现_id字段自动增长。

### 使用 counters 集合

考虑以下 products 文档。我们希望 _id 字段实现 从 1,2,3,4 到 n 的自动增长功能。

```
{
  "_id":1,
  "product_name": "Apple iPhone",
  "category": "mobiles"
}
```

为此，创建 counters 集合，序列字段值可以实现自动长：

```
>db.createCollection("counters")
```

现在我们向 counters 集合中插入以下文档，使用 productid 作为 key:

```
{
  "_id":"productid",
  "sequence_value": 0
}
```

sequence_value 字段是序列通过自动增长后的一个值。
使用以下命令插入 counters 集合的序列文档中：

```
>db.counters.insert({_id:"productid",sequence_value:0})
```

### 创建 Javascript 函数

现在，我们创建函数 getNextSequenceValue 来作为序列名的输入， 指定的序列会自动增长 1 并返回最新序列值。在本文的实例中序列名为 productid 。

```
>function getNextSequenceValue(sequenceName){
   var sequenceDocument = db.counters.findAndModify(
      {
         query:{_id: sequenceName },
         update: {$inc:{sequence_value:1}},
         new:true
      });
   return sequenceDocument.sequence_value;
}
```

使用 Javascript 函数
接下来我们将使用 getNextSequenceValue 函数创建一个新的文档， 并设置文档 _id 自动为返回的序列值：

```
>db.products.insert({
   "_id":getNextSequenceValue("productid"),
   "product_name":"Apple iPhone",
   "category":"mobiles"})
```

```
>db.products.insert({
   "_id":getNextSequenceValue("productid"),
   "product_name":"Samsung S3",
   "category":"mobiles"})
```
   
就如你所看到的，我们使用 getNextSequenceValue 函数来设置 _id 字段。

为了验证函数是否有效，我们可以使用以下命令读取文档：

```
>db.products.find()
```

以上命令将返回以下结果，我们发现 _id 字段是自增长的：

```
{ "_id" : 1, "product_name" : "Apple iPhone", "category" : "mobiles"}

{ "_id" : 2, "product_name" : "Samsung S3", "category" : "mobiles" }
```