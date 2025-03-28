from flask import Flask, jsonify, request
import psycopg2

app = Flask(__name__)

def get_db_connection():
    conn = psycopg2.connect(
        host="postgres",
        database="escola",
        user="postgres",
        password="postgres"
    )
    return conn

@app.route('/alunos', methods=['GET'])
def listar_alunos():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM alunos;')
    alunos = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(alunos)

@app.route('/alunos', methods=['POST'])
def cadastrar_aluno():
    novo_aluno = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO alunos (aluno_id, nome, endereco, cidade, estado, cep, pais, telefone) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)',
        (novo_aluno['aluno_id'], novo_aluno['nome'], novo_aluno.get('endereco'), novo_aluno.get('cidade'),
         novo_aluno.get('estado'), novo_aluno.get('cep'), novo_aluno.get('pais'), novo_aluno.get('telefone'))
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Aluno cadastrado com sucesso!'}), 201

# Similar para rotas de UPDATE e DELETE

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)