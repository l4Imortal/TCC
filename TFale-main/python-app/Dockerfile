FROM python:3.10-slim
# Define o diretório de trabalho
WORKDIR /app
# Copia os arquivos de requisitos e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copia o código da aplicação
COPY ./app /app
# Define variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_database
# Expõe a porta da aplicação
EXPOSE 8000
# Comando para iniciar a aplicação
CMD ["python", "main.py"]

FROM postgres:latest

ENV POSTGRES_DB=escola
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

COPY init.sql /docker-entrypoint-initdb.d/

FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]