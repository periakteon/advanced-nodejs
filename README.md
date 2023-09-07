# İleri Seviye Node.js - `Streams`

## Giriş

Node.js'te yer alan `streams` verileri okuma ve yazma işlemlerini kolaylaştıran güçlü bir konsepttir. `Streams`, büyük veri miktarlarını işlerken hafızayı/belleği/memory'i etkin bir şekilde kullanmanıza yardımcı olurlar.

Node.js'te üç tür stream bulunur:

- **Readable:** Veri **okuma** işlemleri için kullanılır.
- **Writable:** Veri **yazma** işlemleri için kullanılır.
- **Duplex:** **Hem okuma hem de yazma** işlemleri için kullanılır.

## Fake Veri Oluşturma

Öncelikle veri okumak için `faker` paketini kullanarak fake bir veri dosyası oluşturalım.

```js
import fs from "fs";
import { faker } from "@faker-js/faker";

const writeStream = fs.createWriteStream("./data/import.csv");

writeStream.write("name;email;age;salary;isActive\n");

for (let index = 0; index < 50; index++) {
  const firstName = faker.person.firstName();
  const email = faker.internet.email({ firstName });
  const age = faker.number.int({ min: 10, max: 100 });
  const salary = faker.string.numeric(4, { allowLeadingZeros: true });
  const active = faker.datatype.boolean();

  const arr = [firstName, email, age, salary, active];
  writeStream.write(arr.join(";") + "\n");
}

writeStream.end();
```

Yukarıdaki kodda `faker` paketini kullanarak 50 adet fake veri oluşturduk ve `data/import.csv` dosyasına yazdık.

## Stream Kullanarak Veri Okuma

Biz bu verileri, `stream` kullanarak okuyacağız:

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv");

  readStream.on("data", (chunk) => {
    console.log("BUFFER >>>");
    console.log(chunk);
  });
})();
```

Yukarıdaki kodda `fs` paketini kullanarak `data/import.csv` dosyasını okuduk ve `chunk` adı verilen parçalar halinde konsola yazdırdık.

`on` fonksiyonu, `stream`'in bir event'i dinlemesini sağlar. `data` olayı, `stream`'in veri okuması event'idir. Zaten genelde en çok kullanılan iki event `data` ve `end` event'idir. Tüm event'lerin listesi için, bkz.

![Events][event]

[event]: https://i.hizliresim.com/drhv121.png

Biz `data` event'ini seçtiğimizde callback fonksiyonu içerisindeki `chunk` parametresi, `stream`'in okuduğu veriyi temsil eder ve bu veri, `string` ya da `Buffer` tipinde bir veridir. `Buffer` tipi, Node.js'te verilerin okunması ve yazılması için kullanılan bir veri tipidir ve aslında Golang'teki `byte` tipine benzer.

![Buffer][buffer]

[buffer]: https://i.hizliresim.com/dihc3dj.png

Yazdığımız kodu çalıştırdığımızda ise aşağıdaki gibi bir çıktı alırız:

![Konsol][console]

[console]: https://i.hizliresim.com/jjlrl54.png

Gördüğünüz gibi `chunk` parametresi, `Buffer` tipinde bir veri olarak gelmektedir. Bu veriyi `string` tipine çevirmek için `toString` fonksiyonunu kullanabiliriz:

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv");

  readStream.on("data", (chunk) => {
    console.log("BUFFER >>>");
    console.log(chunk.toString());
  });
})();
```

Yukarıdaki kodu çalıştırdığımızda ise aşağıdaki gibi bir çıktı alırız:

![Konsol][console2]

[console2]: https://i.hizliresim.com/88sha2n.png

Peki tüm bu `stream`in bitip bitmediğini nasıl anlayacağız? Bunun için `end` event'ini kullanabiliriz:

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv");

  readStream.on("data", (chunk) => {
    console.log("BUFFER >>>");
    console.log(chunk.toString());
  });

  readStream.on("end", () => {
    console.log("END OF STREAM");
  });
})();
```

## `highWaterMark` Özelliği

`highWaterMark` özelliği, `stream`'in okuyabileceği maksimum veri miktarını belirler. Bu özellik, `stream`'in belleği ne kadar kullanacağını belirler. Varsayılan olarak bu değer `16 KB`'dır. Biz bu değeri `1 KB` olarak değiştirelim:

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv", {
    highWaterMark: 1024,
  });

  readStream.on("data", (chunk) => {
    console.log("BUFFER >>>");
    console.log(chunk.toString());
  });

  readStream.on("end", () => {
    console.log("END OF STREAM");
  });
})();
```

Bundan böyle `stream`'in belleği `1 KB`'lık parçalar halinde kullanacağını göreceksiniz. Yani, `stream`'in belleği `1 KB`'lık parçalar halinde kullanıldıktan sonra, `stream`'in belleği boşalana kadar yeni bir parça okunmayacaktır. Tıpkı bir borunun içerisindeki suyun, borunun ucuna ulaşana kadar birikmesi gibi. Bu özelliği, `stream`'in belleği ne kadar kullanacağını belirlemek için kullanabilirsiniz.

Bu kodun çıktısını ise aşağıdaki gibi alırsınız:

![Konsol][console3]

[console3]: https://i.hizliresim.com/ta2sy1c.png

Toparlayacak olursak, `highWaterMark` özelliği, bir Readable Stream'in içinde bulunan verilerin okunma hızını ve boyutunu kontrol etmek için kullanılır. Bu özellik, verilerin ne kadarlık bir boyutta okunacağını belirler. Özellikle büyük dosyaları okurken bellek kullanımını kontrol etmek için önemlidir.

Örnekte verilen kodda `highWaterMark` `1024` olarak ayarlanmıştır. Bu, her seferinde `1024` byte'lık bir veri yığını okunmasını sağlar. Yani, dosyanın içeriği `1024` byte'lık parçalara bölünerek okunur ve `data` event'i tetiklendiğinde bu parçalar birer birer işlenir.

Bu, bellek kullanımını kontrol etmek ve büyük dosyaları daha küçük parçalara bölmek için kullanışlıdır. Özellikle büyük dosyaları okurken veya ağ üzerinden veri akışını işlerken `highWaterMark` değeri ayarlamak, performans ve bellek yönetimi açısından önemlidir.

## Write Streams

Şimdi de `stream` kullanarak veri yazmayı görelim:

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv", {
    highWaterMark: 800,
  });

  const writeStream = fs.createWriteStream("./data/export.csv");

  readStream.on("data", (chunk) => {
    console.log("BUFFER >>>");
    console.log(chunk.toString());

    writeStream.write(chunk);
  });

  readStream.on("end", () => {
    console.log("END OF STREAM");

    writeStream.end();
  });
})();
```

Yukarıdaki kodda ilk olarak `data/import.csv` dosyasını okuyup, `data/export.csv` dosyasına yazdık. Ardında `readStream`'in `data` event'ini dinleyerek, `chunk` parametresini `writeStream`'e yazdırdık. Son olarak da `readStream`'in `end` event'ini dinleyerek, `writeStream`'i kapattık. Böylece okumuş olduğumuz verileri `writeStream`'e yazdırmış olduk.

## Write Streams ile İlgili Sorunlar: `backpressure`

`createWriteStream`in bu şekilde kullanılması `backpressure` sorununa yol açabilir. `backpressure` sorunu, `stream`'in okuma (read) hızının yazma (write) hızından daha yavaş olması durumunda ortaya çıkar (veya tam tersi). Bu durumda `stream`'in belleği dolar ve `stream`'in belleği dolduğu için yeni bir veri okunamaz veya tam tersi durumda yeni bir veri yazılamaz.

![Backpressure][backpressure]

[backpressure]: https://i.hizliresim.com/dd3zoez.png

Bu konuyla ilgili güzel bir makale için, bkz. [Backpressuring in Streams](https://nodejs.org/en/docs/guides/backpressuring-in-streams).

## `backpressure` Sorununu Çözmek: `pipe`

`pipe` fonksiyonunu kullanarak, `backpressure` sorununu çözebiliriz. `pipe` fonksiyonu, bir `stream`'in çıktısını başka bir `stream`'e bağlamak için kullanılır. Yani, `pipe` fonksiyonu, bir `stream`'in çıktısını başka bir `stream`'e bağlar. Bu sayede `stream`'in çıktısı, başka bir `stream`'e yazılabilir. Adından (_pipe_) da anlaşılacağı üzere, gerçekten de bir boru gibi çalışır. Boruların çalışma mantığına benzer şekilde, bir `stream`'in çıktısı başka bir `stream`'e bağlanır ve bu sayede `backpressure` sorunu çözülmüş olur. Ayrıca çok daha basit bir yapıya sahip olur.

```js
import fs from "fs";

(async () => {
  const readStream = fs.createReadStream("./data/import.csv");

  const writeStream = fs.createWriteStream("./data/export.csv");

  readStream.pipe(writeStream);

  readStream.on("end", () => {
    console.log("Stream ended");
  });

  writeStream.on("finish", () => {
    console.log("Write stream finished");
  });
  
})();
```

Yukarıdaki kodda `pipe` fonksiyonunu kullanarak, `readStream`'in çıktısını `writeStream`'e bağladık. Bu sayede `backpressure` sorununu çözmüş olduk. Ayrıca `readStream`'in `end` event'ini ve `writeStream`'in de `finish` event'ini dinleyerek, `stream`'lerin bitmesi durumunda konsola mesaj yazdırdık.

## Real Life Example: `pipe`

Gerçek hayatta bu `pipe` fonksiyonunu kullanmak için öncelikle büyük boyutlarda bir dosya oluşturalım:

```js
import fs from "fs";
const file = fs.createWriteStream('./big.file');

for(let i=0; i<= 1e6; i++) {
  file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
}

file.end();
```

Yukarıdaki kod, yaklaşık olarak 400 MB'lık bir dosya oluşturur. Oluşturduğumuz bu kodu daha sonra bir server oluşturup serve edelim:

```js
import fs from "fs";
import http from "http";

const server = http.createServer();

server.on('request', (req, res) => {
  fs.readFile('./big.file', (err, data) => {
    if (err) throw err;
  
    res.end(data);
  });
});

server.listen(8000);
```

Ardından bu server'ı başlatalım ve `curl` ile `localhost:8000` adresine istek atalım:

```bash
curl localhost:8000
```

Bilgisayarımızın hafızası/belleği bu isteği atmadan önce normal boyutlardayken, bu isteği karşılamaya çalışırken oldukça yükseldiğini göreceksiniz. Bunun nedeni oldukça büyük olan `big.file` dosyamızı tek seferde response olarak döndürmeye çalışmamızdır. Bu, kullanışsız bir yoldur. Bunun yerine Node'da bulunan`fs` modülünün içerisinde yer alan `createReadStream` fonksiyonunu kullanarak, bunu `pipe` fonksiyonuyla birleştirebiliriz.

```js
import fs from "fs";
import http from "http";

const server = http.createServer();

server.on('request', (req, res) => {
  const src = fs.createReadStream('./big.file');
  src.pipe(res);
});

server.listen(8000);
```

Bu kodu çalıştırdığımızda, belleğin yükselmediğini göreceksiniz. Çünkü `pipe` fonksiyonu, `backpressure` sorununu çözmek için kullanılır. Bu sayede bellek kullanımı da oldukça düşer. Tekrar `curl` ile `localhost:8000` adresine istek atalım:

```bash
curl localhost:8000
```

Bu sefer bellek kullanımının yükselmediğini göreceksiniz. Bunun sebebi tıpkı bir boru hattı döşüyor gibi, `pipe` fonksiyonuyla `stream`'lerin birbirine bağlanmasıdır. Bu sayede `backpressure` sorunu çözülmüş olur. Yani, tek bir seferde tüm veriyi vermeye çalışmak yerine bir `chunk`, yani bir parça halinde veri gönderilir. Bu sayede bellek kullanımı da oldukça düşer.

![Pipeline][pipe]

[pipe]: https://i.stack.imgur.com/VVoUb.png

![Pipeline][pipe2]

[pipe2]: https://cdn-media-1.freecodecamp.org/images/1*lhOvZiDrVbzF8_l8QX3ACw.png

***

PART 2: https://www.youtube.com/watch?v=5w_nZnev3kk


