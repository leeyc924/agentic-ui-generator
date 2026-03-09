import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  MessageSquare,
  Layers,
  Code,
  Zap,
  ArrowRight,
  FolderOpen,
  Plus,
} from "lucide-react";
import { api } from "../lib/api";
import type { Project } from "../lib/types";

function FeatureCard({
  icon,
  title,
  description,
}: {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="p-5 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function RecentProject({ project }: { readonly project: Project }) {
  const widgetCount = project.document.components.length;
  const date = new Date(project.updated_at).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      to={`/preview/${project.id}`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface border border-border hover:border-accent/40 transition-colors group"
    >
      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center text-accent shrink-0">
        <Layers size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {project.name}
        </p>
        <p className="text-xs text-text-muted">
          위젯 {widgetCount}개 &middot; {date}
        </p>
      </div>
      <ArrowRight
        size={16}
        className="text-text-muted group-hover:text-accent shrink-0 transition-colors"
      />
    </Link>
  );
}

export function HomePage() {
  const [recentProjects, setRecentProjects] = useState<readonly Project[]>([]);

  useEffect(() => {
    api.projects
      .list()
      .then((projects) => setRecentProjects(projects.slice(0, 5)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="h-12 bg-surface border-b border-border flex items-center px-6">
        <h1 className="text-lg font-semibold text-text-primary">A2UI</h1>
        <div className="mr-auto" />
        <nav className="flex items-center gap-4">
          <Link
            to="/editor"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            에디터
          </Link>
          <Link
            to="/projects"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            프로젝트
          </Link>
          <Link
            to="/assets"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            자산 관리
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-16 pb-12">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-5">
          <Sparkles size={28} />
        </div>
        <h2 className="text-3xl font-bold text-text-primary mb-3">
          자연어로 UI를 만드세요
        </h2>
        <p className="text-text-muted max-w-lg leading-relaxed">
          A2UI는 자연어 설명을 실시간 UI로 변환합니다. Slack 또는 웹 에디터에서
          원하는 화면을 말하면 AI가 즉시 생성하고, 바로 편집하고, 코드로 추출할
          수 있습니다.
        </p>
        <div className="flex gap-3 mt-8">
          <Link
            to="/editor"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} />새 UI 만들기
          </Link>
          <Link
            to="/projects"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-text-primary text-sm font-medium hover:bg-surface transition-colors"
          >
            <FolderOpen size={16} />
            프로젝트 목록
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-12 max-w-4xl mx-auto w-full">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          주요 기능
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <FeatureCard
            icon={<MessageSquare size={20} />}
            title="자연어 생성"
            description="채팅으로 UI를 설명하면 AI가 실시간으로 컴포넌트를 생성합니다."
          />
          <FeatureCard
            icon={<Layers size={20} />}
            title="비주얼 에디터"
            description="드래그 앤 드롭, 속성 편집, 스타일 조정을 직관적으로 할 수 있습니다."
          />
          <FeatureCard
            icon={<Zap size={20} />}
            title="워크플로우"
            description="버튼 클릭, 폼 제출 등 인터랙션에 API 호출과 페이지 이동을 연결합니다."
          />
          <FeatureCard
            icon={<Code size={20} />}
            title="코드 추출"
            description="완성된 UI를 React + TailwindCSS 코드로 바로 내보낼 수 있습니다."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-12 max-w-4xl mx-auto w-full">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
          사용 흐름
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          {[
            {
              step: "1",
              title: "설명하기",
              desc: "채팅 또는 Slack에서 원하는 UI를 자연어로 설명",
            },
            {
              step: "2",
              title: "편집하기",
              desc: "생성된 UI를 비주얼 에디터에서 세부 조정",
            },
            {
              step: "3",
              title: "연결하기",
              desc: "워크플로우로 API 연동, 페이지 이동 설정",
            },
            {
              step: "4",
              title: "추출하기",
              desc: "JSON 또는 React 코드로 내보내서 프로젝트에 적용",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex-1 p-4 rounded-xl bg-surface border border-border"
            >
              <span className="inline-flex w-6 h-6 rounded-full bg-accent text-white text-xs font-bold items-center justify-center mb-2">
                {item.step}
              </span>
              <h4 className="text-sm font-semibold text-text-primary mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <section className="px-6 pb-16 max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              최근 프로젝트
            </h3>
            <Link
              to="/projects"
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              전체 보기
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentProjects.map((project) => (
              <RecentProject key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
