from app.services.llm import (
    GenerateRequest,
    _build_system_prompt,
    _build_user_prompt,
)


def test_build_system_prompt_includes_schema_info():
    prompt = _build_system_prompt()
    assert "A2UI" in prompt
    assert "components" in prompt
    assert "designTokens" in prompt
    assert "button" in prompt
    assert "card" in prompt


def test_build_system_prompt_includes_all_component_types():
    prompt = _build_system_prompt()
    for comp_type in [
        "card",
        "text",
        "button",
        "text-field",
        "select",
        "checkbox",
        "image",
        "icon",
        "divider",
        "container",
        "grid",
        "stack",
    ]:
        assert comp_type in prompt


def test_build_user_prompt_for_simple_generate():
    req = GenerateRequest(prompt="로그인 폼 만들어줘")
    content = _build_user_prompt(req)
    assert "로그인 폼" in content


def test_build_user_prompt_for_edit_includes_widget_context():
    req = GenerateRequest(
        prompt="버튼 색상을 빨간색으로",
        selected_widget_id="btn-1",
        current_document={
            "version": "0.1.0",
            "components": [
                {"id": "btn-1", "type": "button", "props": {"label": "Click"}},
            ],
        },
    )
    content = _build_user_prompt(req)
    assert "btn-1" in content
    assert "버튼 색상을 빨간색으로" in content
    assert "Click" in content


def test_build_user_prompt_for_edit_with_missing_widget():
    req = GenerateRequest(
        prompt="수정해줘",
        selected_widget_id="nonexistent",
        current_document={
            "version": "0.1.0",
            "components": [{"id": "btn-1", "type": "button"}],
        },
    )
    content = _build_user_prompt(req)
    assert "not found" in content.lower() or "nonexistent" in content


def test_build_user_prompt_without_document_is_simple():
    req = GenerateRequest(prompt="대시보드 만들어줘")
    content = _build_user_prompt(req)
    assert "대시보드 만들어줘" in content
