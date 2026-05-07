TARIFFS = {
    "Gujarat": {
        "default": [
            {"max": 50, "rate": 3.0},
            {"max": 100, "rate": 4.0},
            {"max": 200, "rate": 5.2},
            {"max": float('inf'), "rate": 6.0}
        ],
        "Torrent": [
            {"max": 50, "rate": 3.2},
            {"max": 100, "rate": 4.2},
            {"max": 200, "rate": 5.5},
            {"max": float('inf'), "rate": 6.5}
        ],
        "MGVCL": [
            {"max": 50, "rate": 2.85},
            {"max": 100, "rate": 3.95},
            {"max": 200, "rate": 5.0},
            {"max": float('inf'), "rate": 5.8}
        ],
        "PGVCL": [
            {"max": 50, "rate": 2.90},
            {"max": 100, "rate": 4.05},
            {"max": 200, "rate": 5.1},
            {"max": float('inf'), "rate": 5.9}
        ]
    },
    "Maharashtra": {
        "default": [
            {"max": 100, "rate": 4.5},
            {"max": 300, "rate": 6.5},
            {"max": 500, "rate": 8.5},
            {"max": float('inf'), "rate": 10.5}
        ],
        "MSEDCL": [
            {"max": 100, "rate": 4.0},
            {"max": 300, "rate": 6.0},
            {"max": 500, "rate": 8.0},
            {"max": float('inf'), "rate": 10.0}
        ],
        "Adani": [
            {"max": 100, "rate": 5.0},
            {"max": 300, "rate": 7.0},
            {"max": 500, "rate": 9.0},
            {"max": float('inf'), "rate": 11.0}
        ]
    },
    "Delhi": {
        "default": [
            {"max": 200, "rate": 3.0},
            {"max": 400, "rate": 4.5},
            {"max": 800, "rate": 6.5},
            {"max": float('inf'), "rate": 8.0}
        ],
        "BYPL": [
            {"max": 200, "rate": 3.1},
            {"max": 400, "rate": 4.6},
            {"max": 800, "rate": 6.6},
            {"max": float('inf'), "rate": 8.1}
        ],
        "TPDDL": [
            {"max": 200, "rate": 3.0},
            {"max": 400, "rate": 4.4},
            {"max": 800, "rate": 6.4},
            {"max": float('inf'), "rate": 7.9}
        ]
    },
    "Himachal": {
        "default": [
            {"max": 125, "rate": 4.2},
            {"max": 300, "rate": 5.7},
            {"max": 500, "rate": 6.8},
            {"max": float('inf'), "rate": 7.2}
        ],
        "HPSEB": [
            {"max": 125, "rate": 4.0},
            {"max": 300, "rate": 5.5},
            {"max": 500, "rate": 6.5},
            {"max": float('inf'), "rate": 7.0}
        ]
    },
    "Uttarakhand": {
        "default": [
            {"max": 100, "rate": 3.8},
            {"max": 200, "rate": 5.2},
            {"max": 400, "rate": 6.8},
            {"max": float('inf'), "rate": 7.8}
        ],
        "UPCL": [
            {"max": 100, "rate": 3.5},
            {"max": 200, "rate": 5.0},
            {"max": 400, "rate": 6.5},
            {"max": float('inf'), "rate": 7.5}
        ]
    }
}

# Provider options for each state (for frontend dropdowns)
PROVIDERS_BY_STATE = {
    "Gujarat": ["default", "Torrent", "MGVCL", "PGVCL"],
    "Maharashtra": ["default", "MSEDCL", "Adani"],
    "Delhi": ["default", "BYPL", "TPDDL"],
    "Himachal": ["default", "HPSEB"],
    "Uttarakhand": ["default", "UPCL"]
}
