from flask import Flask, jsonify, request
import psycopg2
import psycopg2.extras

app = Flask(__name__)

# Função para conexão com o banco de dados
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="aula2003",  # Nome do container Docker PostgreSQL
            database="escola",
            user="postgres",
            password="postgres"
        )
        return conn
    except psycopg2.Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

# Rota para listar todos os registros da tabela "Aluno"
@app.route('/alunos', methods=['GET'])
def listar_alunos():
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Falha ao conectar ao banco de dados'}), 500
    
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    try:
        cur.execute('SELECT * FROM Aluno;')
        alunos = cur.fetchall()
        result = [dict(aluno) for aluno in alunos]  # Converte os dados para dict
    except psycopg2.Error as e:
        return jsonify({'error': f'Erro ao consultar dados: {e}'}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify(result), 200

# Rota para cadastrar um novo aluno
@app.route('/alunos', methods=['POST'])
def cadastrar_aluno():
    novo_aluno = request.json
    
    # Validação básica
    if not novo_aluno or not novo_aluno.get('nome_completo'):
        return jsonify({'error': 'O campo "nome_completo" é obrigatório'}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Falha ao conectar ao banco de dados'}), 500

    cur = conn.cursor()
    try:
        cur.execute(
            '''INSERT INTO Aluno (nome_completo, data_nascimento, id_turma, nome_responsavel, telefone_responsavel, email_responsavel, informacoes_adicionais)
               VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id_aluno''',
            (novo_aluno.get('nome_completo'),
             novo_aluno.get('data_nascimento'),
             novo_aluno.get('id_turma'),
             novo_aluno.get('nome_responsavel'),
             novo_aluno.get('telefone_responsavel'),
             novo_aluno.get('email_responsavel'),
             novo_aluno.get('informacoes_adicionais'))
        )
        aluno_id = cur.fetchone()[0]
        conn.commit()
    except psycopg2.Error as e:
        return jsonify({'error': f'Erro ao inserir dados: {e}'}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify({'message': 'Aluno cadastrado com sucesso!', 'id_aluno': aluno_id}), 201

# Rota para atualizar um aluno
@app.route('/alunos/<int:id>', methods=['PUT'])
def atualizar_aluno(id):
    dados_atualizados = request.json

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Falha ao conectar ao banco de dados'}), 500

    cur = conn.cursor()
    try:
        cur.execute(
            '''UPDATE Aluno
               SET nome_completo = %s, data_nascimento = %s, id_turma = %s, nome_responsavel = %s, telefone_responsavel = %s, email_responsavel = %s, informacoes_adicionais = %s
               WHERE id_aluno = %s RETURNING id_aluno''',
            (dados_atualizados.get('nome_completo'),
             dados_atualizados.get('data_nascimento'),
             dados_atualizados.get('id_turma'),
             dados_atualizados.get('nome_responsavel'),
             dados_atualizados.get('telefone_responsavel'),
             dados_atualizados.get('email_responsavel'),
             dados_atualizados.get('informacoes_adicionais'),
             id)
        )
        conn.commit()
        aluno_id = cur.fetchone()
        if not aluno_id:
            return jsonify({'error': 'Aluno não encontrado'}), 404
    except psycopg2.Error as e:
        return jsonify({'error': f'Erro ao atualizar dados: {e}'}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify({'message': 'Aluno atualizado com sucesso!', 'id_aluno': id}), 200

# Rota para excluir um aluno
@app.route('/alunos/<int:id>', methods=['DELETE'])
def excluir_aluno(id):
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Falha ao conectar ao banco de dados'}), 500

    cur = conn.cursor()
    try:
        cur.execute('DELETE FROM Aluno WHERE id_aluno = %s RETURNING id_aluno', (id,))
        conn.commit()
        aluno_id = cur.fetchone()
        if not aluno_id:
            return jsonify({'error': 'Aluno não encontrado'}), 404
    except psycopg2.Error as e:
        return jsonify({'error': f'Erro ao excluir dados: {e}'}), 500
    finally:
        cur.close()
        conn.close()
    
    return jsonify({'message': 'Aluno excluído com sucesso!', 'id_aluno': id}), 200

# Inicializar o servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)