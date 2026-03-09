from app.models.project import Project
from app.models.design_token import DesignToken
from app.models.asset import Asset
from app.models.widget_template import WidgetTemplate


def test_project_model_has_required_columns():
    columns = {c.name for c in Project.__table__.columns}
    assert columns == {"id", "name", "document", "created_at", "updated_at"}


def test_design_token_model_has_required_columns():
    columns = {c.name for c in DesignToken.__table__.columns}
    assert columns == {"id", "name", "tokens", "created_at"}


def test_asset_model_has_required_columns():
    columns = {c.name for c in Asset.__table__.columns}
    assert columns == {"id", "name", "type", "file_path", "metadata", "created_at"}


def test_widget_template_model_has_required_columns():
    columns = {c.name for c in WidgetTemplate.__table__.columns}
    assert columns == {"id", "name", "category", "template", "created_at"}
