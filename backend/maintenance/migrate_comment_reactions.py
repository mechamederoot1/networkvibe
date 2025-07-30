#!/usr/bin/env python3
"""
Migração para adicionar suporte a reações de comentários
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import engine
from sqlalchemy import text, inspect

def check_if_migration_needed():
    """Verificar se a migração é necessária"""
    inspector = inspect(engine)
    
    # Verificar se tabela reactions tem coluna comment_id
    if 'reactions' in inspector.get_table_names():
        reactions_columns = inspector.get_columns('reactions')
        has_comment_id = any(col['name'] == 'comment_id' for col in reactions_columns)
        
        if has_comment_id:
            print("✅ Coluna comment_id já existe na tabela reactions")
            return False
    
    # Verificar se tabela comments tem coluna reactions_count
    if 'comments' in inspector.get_table_names():
        comments_columns = inspector.get_columns('comments')
        has_reactions_count = any(col['name'] == 'reactions_count' for col in comments_columns)
        
        if not has_reactions_count:
            print("⚠️  Coluna reactions_count precisa ser adicionada à tabela comments")
            return True
    
    return True

def run_migration():
    """Executar a migração"""
    
    if not check_if_migration_needed():
        print("✅ Migração não é necessária!")
        return
    
    print("🚀 Iniciando migração para reações de comentários...")
    
    with engine.connect() as connection:
        try:
            # 1. Adicionar coluna comment_id à tabela reactions (se não existir)
            try:
                print("📝 Adicionando coluna comment_id à tabela reactions...")
                connection.execute(text("ALTER TABLE reactions ADD COLUMN comment_id INTEGER NULL REFERENCES comments(id);"))
                connection.commit()
                print("✅ Coluna comment_id adicionada com sucesso!")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print("ℹ️  Coluna comment_id já existe")
                else:
                    print(f"⚠️  Erro ao adicionar comment_id: {e}")
            
            # 2. Adicionar coluna reactions_count à tabela comments (se não existir)
            try:
                print("📝 Adicionando coluna reactions_count à tabela comments...")
                connection.execute(text("ALTER TABLE comments ADD COLUMN reactions_count INTEGER DEFAULT 0;"))
                connection.commit()
                print("✅ Coluna reactions_count adicionada com sucesso!")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print("ℹ️  Coluna reactions_count já existe")
                else:
                    print(f"⚠️  Erro ao adicionar reactions_count: {e}")
            
            # 3. Adicionar constraint para garantir que reação é para post OU comment, não ambos
            try:
                print("📝 Adicionando constraint de validação...")
                connection.execute(text("""
                    ALTER TABLE reactions 
                    ADD CONSTRAINT chk_reaction_target 
                    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL));
                """))
                connection.commit()
                print("✅ Constraint de validação adicionada!")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print("ℹ️  Constraint já existe")
                else:
                    print(f"⚠️  Erro ao adicionar constraint: {e}")
            
            # 4. Atualizar contadores existentes de reações em comentários (se houver)
            try:
                print("📝 Atualizando contadores existentes...")
                connection.execute(text("""
                    UPDATE comments 
                    SET reactions_count = (
                        SELECT COUNT(*) 
                        FROM reactions 
                        WHERE reactions.comment_id = comments.id
                    )
                    WHERE reactions_count IS NULL OR reactions_count = 0;
                """))
                connection.commit()
                print("✅ Contadores atualizados!")
            except Exception as e:
                print(f"⚠️  Erro ao atualizar contadores: {e}")
            
            print("\n🎉 Migração concluída com sucesso!")
            print("✅ Agora é possível:")
            print("   - Reagir a comentários")
            print("   - Contar reações em comentários")
            print("   - Manter integridade dos dados")
            
        except Exception as e:
            print(f"❌ Erro crítico na migração: {e}")
            connection.rollback()
            raise

if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"💥 Falha na migração: {e}")
        sys.exit(1)
