from sqlalchemy.orm import Session
from app.repositories.base import category_repo

DEFAULT_CATEGORIES = [
    # ACCOUNTS categories (from original list)
    {
        "name": "Carteira",
        "type": "ACCOUNTS",
        "color": "#26C6DA",
        "icon": "CardIcon",
        "subcategories": []
    },
    {
        "name": "Conta Corrente",
        "type": "ACCOUNTS",
        "color": "#4EBE87",
        "icon": "AccountBalanceIcon",
        "subcategories": []
    },
    {
        "name": "Investimentos",
        "type": "ACCOUNTS",
        "color": "#42A5F5",
        "icon": "ShowChartIcon",
        "subcategories": []
    },
    {
        "name": "Outros",
        "type": "ACCOUNTS",
        "color": "#7E8494",
        "icon": "HelpIcon",
        "subcategories": []
    },
    # REVENUE categories and subcategories
    {
        "name": "Salário",
        "type": "REVENUE",
        "color": "#4EBE87",
        "icon": "AttachMoneyIcon",
        "subcategories": ["Salário Principal", "Décimo Terceiro", "Bônus / PLR"]
    },
    {
        "name": "Investimentos",
        "type": "REVENUE",
        "color": "#42A5F5",
        "icon": "ShowChartIcon",
        "subcategories": ["Rendimentos / Dividendos", "Resgates"]
    },
    {
        "name": "Outras Receitas",
        "type": "REVENUE",
        "color": "#7E8494",
        "icon": "HelpIcon",
        "subcategories": ["Reembolsos", "Vendas", "Presentes", "Empréstimos"]
    },
    # EXPENSE categories and subcategories
    {
        "name": "Alimentação",
        "type": "EXPENSE",
        "color": "#EC407A",
        "icon": "RestaurantIcon",
        "subcategories": ["Supermercado", "Restaurantes / Delivery", "Lanches / Café"]
    },
    {
        "name": "Moradia",
        "type": "EXPENSE",
        "color": "#7E57C2",
        "icon": "HomeIcon",
        "subcategories": ["Aluguel / Prestação", "Condomínio", "Energia / Água / Gás", "Internet / Telefone", "Manutenção / Reformas"]
    },
    {
        "name": "Transporte",
        "type": "EXPENSE",
        "color": "#FF9800",
        "icon": "DirectionsCarIcon",
        "subcategories": ["Combustível", "Uber / Táxi / Aplicativos", "Transporte Público", "Manutenção de Veículo", "Pedágio / Estacionamento"]
    },
    {
        "name": "Saúde",
        "type": "EXPENSE",
        "color": "#E91E63",
        "icon": "LocalHospitalIcon",
        "subcategories": ["Planos de Saúde", "Farmácia / Medicamentos", "Consultas / Exames", "Dentista"]
    },
    {
        "name": "Lazer",
        "type": "EXPENSE",
        "color": "#FFCA28",
        "icon": "TvIcon",
        "subcategories": ["Cinema / Teatro / Shows", "Viagens / Hotéis", "Assinaturas & Serviços (Netflix, Spotify, etc.)", "Bares & Baladas"]
    },
    {
        "name": "Educação",
        "type": "EXPENSE",
        "color": "#9C27B0",
        "icon": "SchoolIcon",
        "subcategories": ["Mensalidades (Escola / Faculdade)", "Cursos / Treinamentos", "Livros & Materiais"]
    },
    {
        "name": "Outras Despesas",
        "type": "EXPENSE",
        "color": "#607D8B",
        "icon": "HelpIcon",
        "subcategories": ["Presentes / Doações", "Impostos / Taxas", "Tarifas Bancárias", "Imprevistos"]
    }
]

def seed_user_categories(db: Session, user_id):
    for cat in DEFAULT_CATEGORIES:
        parent = category_repo.create(db, obj_in={
            "user_id": user_id,
            "name": cat["name"],
            "type": cat["type"],
            "color": cat["color"],
            "icon": cat["icon"],
            "show_in_accounts_by_category": True,
            "show_in_category_summary": True,
            "show_in_category_balance": True
        })
        
        for sub_name in cat["subcategories"]:
            category_repo.create(db, obj_in={
                "user_id": user_id,
                "name": sub_name,
                "type": cat["type"],
                "color": cat["color"],
                "icon": cat["icon"],
                "parent_category_id": parent.id,
                "show_in_accounts_by_category": True,
                "show_in_category_summary": True,
                "show_in_category_balance": True
            })
