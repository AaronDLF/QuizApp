"""
Script para migrar la base de datos y agregar la columna answer_type a la tabla questions.
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
# Format: postgresql://user:password@host:port/dbname
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
    
    # Verificar si la columna ya existe
    cursor.execute("""
        SELECT EXISTS(
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='questions' AND column_name='answer_type'
        )
    """)
    
    column_exists = cursor.fetchone()[0]
    
    if column_exists:
        print("✓ La columna 'answer_type' ya existe en la tabla 'questions'")
    else:
        print("Agregando columna 'answer_type' a la tabla 'questions'...")
        cursor.execute("""
            ALTER TABLE questions
            ADD COLUMN answer_type VARCHAR DEFAULT 'options'
        """)
        conn.commit()
        print("✓ Columna 'answer_type' agregada exitosamente")
    
    cursor.close()
    conn.close()
    print("\n✓ Migración completada exitosamente")
    
except Exception as e:
    print(f"✗ Error durante la migración: {e}")
    if conn:
        conn.rollback()
        conn.close()
    exit(1)
