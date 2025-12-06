"""
Script para actualizar todas las preguntas existentes con answer_type por defecto
"""
import psycopg2
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv('.env.local')

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("✗ DATABASE_URL no está configurada en .env.local")
    exit(1)

# Parsear la URL de base de datos de forma más segura
db_url = DATABASE_URL.replace('postgresql://', '')
parts = db_url.split('@')
if len(parts) != 2:
    print("✗ Formato de DATABASE_URL inválido")
    exit(1)

user_pass = parts[0]
host_port_db = parts[1]

# Separar user y password
if ':' in user_pass:
    user, password = user_pass.split(':', 1)
else:
    user = user_pass
    password = ''

# Separar host:port de dbname
if '/' in host_port_db:
    host_port, dbname = host_port_db.split('/', 1)
else:
    host_port = host_port_db
    dbname = ''

# Separar host y port
if ':' in host_port:
    host, port_str = host_port.rsplit(':', 1)
    try:
        port = int(port_str)
    except ValueError:
        port = 5432
else:
    host = host_port
    port = 5432

print(f"Conectando a PostgreSQL en {host}:{port}...")
print(f"Base de datos: {dbname}")

conn = None
try:
    # Conectar a la base de datos
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=dbname,
        user=user,
        password=password
    )
    cursor = conn.cursor()
    
    print("✓ Conectado a la base de datos")
    
    # Actualizar todas las preguntas que tienen answer_type NULL
    cursor.execute("""
        UPDATE questions
        SET answer_type = 'options'
        WHERE answer_type IS NULL
    """)
    
    rows_updated = cursor.rowcount
    conn.commit()
    
    print(f"✓ {rows_updated} preguntas actualizadas con answer_type='options'")
    
    # Modificar la restricción de llave foránea
    print("\nModificando restricción de llave foránea...")
    
    # Eliminar la restricción anterior
    cursor.execute("""
        ALTER TABLE quiz_history
        DROP CONSTRAINT IF EXISTS quiz_history_quiz_id_fkey
    """)
    
    # Agregar la nueva restricción con ON DELETE SET NULL
    cursor.execute("""
        ALTER TABLE quiz_history
        ADD CONSTRAINT quiz_history_quiz_id_fkey
        FOREIGN KEY (quiz_id)
        REFERENCES quizzes(id)
        ON DELETE SET NULL
    """)
    
    conn.commit()
    print("✓ Restricción modificada exitosamente")
    print("  Ahora cuando se elimine un quiz, quiz_id se establecerá en NULL en quiz_history")
    
    cursor.close()
    conn.close()
    print("\n✓ Migración completada exitosamente")
    
except Exception as e:
    print(f"✗ Error durante la migración: {e}")
    if conn:
        conn.rollback()
        conn.close()
    exit(1)
