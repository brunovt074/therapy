"""Seed: Kinesiología, Pilates terapéutico, Wellness.

Uso (desde la raíz de therapy-api con venv activo):
    python scripts/seed_specialties.py

Re-runnable: skipea slugs que ya existen.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from sqlalchemy import select

from therapy.shared.infrastructure.database.connection import AsyncSessionLocal
from therapy.shared.infrastructure.database.tables.specialty_table import SpecialtyTable


SPECIALTIES = [
    {
        "name": "Kinesiología",
        "slug": "kinesiologia",
        "description": (
            "Evaluación y tratamiento de afecciones del aparato locomotor. "
            "Trabajo manual y ejercicio terapéutico personalizado."
        ),
        "duration_min": 45,
        "color": "#B85C38",
        "max_slots": 1,
        "available_slots": 1,
    },
    {
        "name": "Pilates terapéutico",
        "slug": "pilates-terapeutico",
        "description": (
            "Método Pilates aplicado a la rehabilitación y el fortalecimiento postural. "
            "Ideal para dolor crónico y recuperación funcional."
        ),
        "duration_min": 60,
        "color": "#7B8C76",
        "max_slots": 1,
        "available_slots": 1,
    },
    {
        "name": "Wellness",
        "slug": "wellness",
        "description": (
            "Sesiones integrales de bienestar que combinan masajes, "
            "técnicas de relajación y movimiento consciente."
        ),
        "duration_min": 60,
        "color": "#C49A6C",
        "max_slots": 1,
        "available_slots": 1,
    },
]


async def seed() -> None:
    now = datetime.now(timezone.utc)
    async with AsyncSessionLocal() as session:
        existing_slugs = {
            row[0]
            for row in (
                await session.execute(select(SpecialtyTable.slug))
            ).all()
        }

        created = 0
        for data in SPECIALTIES:
            if data["slug"] in existing_slugs:
                print(f"  skip: {data['slug']} (ya existe)")
                continue
            session.add(
                SpecialtyTable(
                    name=data["name"],
                    slug=data["slug"],
                    description=data["description"],
                    duration_min=data["duration_min"],
                    color=data["color"],
                    active=True,
                    max_slots=data["max_slots"],
                    available_slots=data["available_slots"],
                    created_at=now,
                    updated_at=now,
                )
            )
            created += 1

        await session.commit()
        print(f"✅ Insertadas {created} especialidades ({len(existing_slugs)} ya existían).")


if __name__ == "__main__":
    asyncio.run(seed())
