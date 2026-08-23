import { useRef } from 'react';
import FanPreview from './components/FanPreview';
import { PhoneCarousel } from './pages/MiniProgram';

export default function App() {
  const scrollRef = useRef(null);

  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
  };

  return (
    <div className="home" ref={scrollRef}>
      {/* 第 1 页：乙手记 */}
      <section className="home-page home-page--hero">
        <span className="hero-badge">微信小程序</span>
        <h1 className="hero-title">乙手记</h1>
        <p className="hero-en">My Otome Logs</p>
        <p className="hero-intro">
          专为国内日本乙女游戏玩家开发的记录与管理小程序，
          <br />
          整合官方信息，提供购入、游玩进度与 repo 记录工具。
        </p>
        <div className="hero-stats">
          <div className="stat">
            <b>1.7万+</b>
            <span>累计用户</span>
          </div>
          <div className="stat">
            <b>1500+</b>
            <span>日活跃</span>
          </div>
          <div className="stat stat--qr">
            <img src="assets/common/miniprogram.png" alt="乙手记小程序码" />
            <span>微信扫码使用</span>
          </div>
          <a
            className="stat stat--author"
            href="https://xhslink.cn/m/2SiNsYt3prj"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="assets/common/kinmokusei.png" alt="金木犀头像" />
            <span className="author-text">
              <span className="author-dev">开发者小红书</span>
              <span className="author-name">@金木犀</span>
            </span>
          </a>
        </div>
        <button className="home-arrow" onClick={scrollNext} aria-label="下滑">
          ↓
        </button>
      </section>

      {/* 第 2 页：界面预览 */}
      <section className="home-page home-page--preview">
        <h2 className="home-page-title">界面预览</h2>
        <p className="home-page-sub">以下界面仅供展示，预览界面内可上下滑动</p>
        <FanPreview />
        <button className="home-page-btn" onClick={scrollNext}>
          下滑查看功能详解 ↓
        </button>
      </section>

      {/* 第 3 页：功能详解 */}
      <section className="home-page home-page--detail">
        <h2 className="home-page-title">功能详解</h2>
        <p className="home-page-sub">点击上方标签或左右切换查看各界面，说明标注位于手机右侧</p>
        <PhoneCarousel />
      </section>
    </div>
  );
}
