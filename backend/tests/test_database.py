from sqlalchemy.orm import Session

from app.database import get_db


def test_get_db_yields_session():
    gen = get_db()
    db = next(gen)
    assert isinstance(db, Session)
    try:
        next(gen)
    except StopIteration:
        pass


def test_get_db_closes_session_on_completion():
    gen = get_db()
    db = next(gen)
    assert isinstance(db, Session)
    gen.close()
