import { parse } from 'csv-parse';
import { createReadStream } from 'node:fs';
import { request } from 'node:http';
import { fileURLToPath } from 'node:url';

// Convert URL to file path
const tasksCsvPath = fileURLToPath(new URL('./tasks.csv', import.meta.url));

async function importCsv() {
  const parser = createReadStream(tasksCsvPath).pipe(
    parse({
      delimiter: ',',
      columns: true,
      trim: true,
    })
  );

  for await (const record of parser) {
    const { title, description } = record;

    const postData = JSON.stringify({ title, description });

    const req = request(
      {
        hostname: 'localhost',
        port: 3333,
        path: '/tasks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 201) {
            console.log(`Task "${title}" criada com sucesso!`);
          } else {
            console.error(`Erro ao criar task "${title}": ${res.statusCode}`);
            console.error(`Resposta do servidor: ${data}`);
          }
        });
      }
    );

    req.on('error', (error) => {
      console.error(`Erro na requisição: ${error.message}`);
    });

    req.write(postData);
    req.end();
  }
}

// Executando a função
importCsv().catch((error) =>
  console.error(`Erro ao importar CSV: ${error.message}`)
);
