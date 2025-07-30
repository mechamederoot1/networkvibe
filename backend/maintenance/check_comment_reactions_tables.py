#!/usr/bin/env python3
"""
Verificar se existem tabelas para reações de comentários
"""
import sys
import os
from sqlalchemy import inspect, text

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine, SessionLocal

def check_tables():
    """Verificar estrutura das tabelas relacionadas a comentários e reações"""
    
    # Criar inspector para verificar estrutura do banco
    inspector = inspect(engine)
    
    print("🔍 VERIFICAÇÃO DE TABELAS - REAÇÕES DE COMENTÁRIOS")
    print("="*60)
    
    # Listar todas as tabelas
    tables = inspector.get_table_names()
    print(f"📊 Total de tabelas no banco: {len(tables)}")
    print(f"📋 Tabelas: {', '.join(tables)}")
    
    print("\n" + "="*40)
    
    # Verificar tabela de comentários
    if 'comments' in tables:
        print("✅ Tabela 'comments' encontrada")
        
        comments_columns = inspector.get_columns('comments')
        print("\n📋 Colunas da tabela 'comments':")
        for col in comments_columns:
            print(f"  - {col['name']}: {col['type']} {'(NOT NULL)' if not col['nullable'] else '(NULL)'}")
    else:
        print("❌ Tabela 'comments' NÃO encontrada")
    
    # Verificar tabela de reações
    if 'reactions' in tables:
        print("\n✅ Tabela 'reactions' encontrada")
        
        reactions_columns = inspector.get_columns('reactions')
        print("\n📋 Colunas da tabela 'reactions':")
        for col in reactions_columns:
            print(f"  - {col['name']}: {col['type']} {'(NOT NULL)' if not col['nullable'] else '(NULL)'}")
            
        # Verificar se há coluna comment_id
        has_comment_id = any(col['name'] == 'comment_id' for col in reactions_columns)
        if has_comment_id:
            print("✅ Coluna 'comment_id' encontrada na tabela reactions")
        else:
            print("❌ Coluna 'comment_id' NÃO encontrada na tabela reactions")
    else:
        print("\n❌ Tabela 'reactions' NÃO encontrada")
    
    # Verificar se existe tabela específica para reações de comentários
    comment_reactions_tables = [t for t in tables if 'comment' in t.lower() and 'reaction' in t.lower()]
    if comment_reactions_tables:
        print(f"\n✅ Tabelas específicas para reações de comentários: {comment_reactions_tables}")
    else:
        print("\n❌ Nenhuma tabela específica para reações de comentários encontrada")
    
    # Verificar tabela shares
    if 'shares' in tables:
        print("\n✅ Tabela 'shares' encontrada")
        
        shares_columns = inspector.get_columns('shares')
        print("\n📋 Colunas da tabela 'shares':")
        for col in shares_columns:
            print(f"  - {col['name']}: {col['type']} {'(NOT NULL)' if not col['nullable'] else '(NULL)'}")
    else:
        print("\n❌ Tabela 'shares' NÃO encontrada")
    
    print("\n" + "="*40)
    print("📝 ANÁLISE E RECOMENDAÇÕES:")
    print("="*40)
    
    # Análise das necessidades
    needs_comment_reactions = 'reactions' not in tables or not any(col['name'] == 'comment_id' for col in inspector.get_columns('reactions') if 'reactions' in tables)
    
    if needs_comment_reactions:
        print("❌ NECESSÁRIO: Criar estrutura para reações de comentários")
        print("   Opções:")
        print("   1. Adicionar coluna 'comment_id' à tabela 'reactions' existente")
        print("   2. Criar tabela específica 'comment_reactions'")
        print("   RECOMENDAÇÃO: Adicionar 'comment_id' à tabela 'reactions' (mais simples)")
    else:
        print("✅ Estrutura para reações de comentários já existe")
    
    if 'comments' not in tables:
        print("❌ NECESSÁRIO: Criar tabela 'comments'")
    else:
        # Verificar se comments tem campo reactions_count
        comments_columns = inspector.get_columns('comments')
        has_reactions_count = any(col['name'] == 'reactions_count' for col in comments_columns)
        if not has_reactions_count:
            print("⚠️  RECOMENDADO: Adicionar coluna 'reactions_count' à tabela 'comments'")
        else:
            print("✅ Campo 'reactions_count' já existe na tabela comments")
    
    if 'shares' not in tables:
        print("❌ NECESSÁRIO: Criar tabela 'shares'")
    else:
        print("✅ Tabela 'shares' já existe")

def create_comment_reactions_migration():
    """Criar script de migração se necessário"""
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    migration_sql = []
    
    # Verificar se precisa adicionar comment_id à tabela reactions
    if 'reactions' in tables:
        reactions_columns = inspector.get_columns('reactions')
        has_comment_id = any(col['name'] == 'comment_id' for col in reactions_columns)
        
        if not has_comment_id:
            migration_sql.append(
                "ALTER TABLE reactions ADD COLUMN comment_id INTEGER NULL REFERENCES comments(id);"
            )
            migration_sql.append(
                "ALTER TABLE reactions ADD CONSTRAINT chk_reaction_target CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL));"
            )
    
    # Verificar se precisa adicionar reactions_count à tabela comments
    if 'comments' in tables:
        comments_columns = inspector.get_columns('comments')
        has_reactions_count = any(col['name'] == 'reactions_count' for col in comments_columns)
        
        if not has_reactions_count:
            migration_sql.append(
                "ALTER TABLE comments ADD COLUMN reactions_count INTEGER DEFAULT 0;"
            )
    
    if migration_sql:
        print("\n" + "="*50)
        print("📜 SCRIPT DE MIGRAÇÃO NECESSÁRIO:")
        print("="*50)
        
        migration_script = """#!/usr/bin/env python3
\"\"\"
Migração para adicionar suporte a reações de comentários
\"\"\"
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from sqlalchemy import text

def run_migration():
    with engine.connect() as connection:
        try:
"""
        
        for sql in migration_sql:
            migration_script += f"""
            print("Executando: {sql}")
            connection.execute(text("{sql}"))
            connection.commit()"""
        
        migration_script += """
            print("✅ Migração concluída com sucesso!")
            
        except Exception as e:
            print(f"❌ Erro na migração: {e}")
            connection.rollback()
            raise

if __name__ == "__main__":
    run_migration()
"""
        
        # Salvar script de migração
        with open('backend/maintenance/migrate_comment_reactions.py', 'w') as f:
            f.write(migration_script)
        
        print("💾 Script de migração salvo em: backend/maintenance/migrate_comment_reactions.py")
        print("\n📋 Para executar a migração:")
        print("cd backend && python maintenance/migrate_comment_reactions.py")
        
        return True
    else:
        print("\n✅ Nenhuma migração necessária!")
        return False

if __name__ == "__main__":
    check_tables()
    print("\n" + "="*50)
    create_comment_reactions_migration()
