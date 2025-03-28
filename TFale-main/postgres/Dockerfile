FROM postgres:14
# Adiciona arquivos de configuração personalizados se necessário
COPY postgresql.conf /etc/postgresql/postgresql.conf
# Adiciona scripts de inicialização
COPY init.sql /docker-entrypoint-initdb.d/
# Define argumentos e variáveis de ambiente
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_DB=app_database
# Expõe a porta padrão do PostgreSQL
EXPOSE 5432
# Comando para iniciar o PostgreSQL com a configuração personalizada
CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
