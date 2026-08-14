import { useRef, useState } from 'react';
import { games } from '../data';
import './MiniProgram.css';

// ============ 数据（作品资源来自网页 assets） ============
const GAME = games.find((g) => g.id === '1925'); // 虔诚之花的晚钟-ricordo-
const DANTE = GAME.characters.find((c) => c.name === '但丁');

const INDEX_GAMES = games
  .filter((g) => g.cover)
  .slice(0, 5)
  .map((g, i) => ({
    id: g.id,
    name: g.name,
    name_jp: g.name_jp,
    cover: g.cover,
    tags: (g.tags || []).slice(0, 3),
    status: ['in', 'out', 'pending', 'in', 'out'][i]
  }));

const SAMPLE_CHARS = games
  .flatMap((g) => (g.characters || []).map((c) => ({ ...c })))
  .filter((c) => c.avatar)
  .slice(0, 8);

const CABINET_GAMES = games
  .filter((g) => g.cover)
  .slice(0, 6)
  .map((g, i) => ({
    id: g.id,
    name: g.name,
    name_jp: g.name_jp,
    cover: g.cover,
    status: ['in', 'out', 'lent', 'in', 'in', 'pending'][i],
    price: ['***', '¥398', '***', '¥520', '***', '---'][i]
  }));

const RECORD_GAMES = games
  .filter((g) => g.cover)
  .slice(0, 4)
  .map((g, i) => ({
    id: g.id,
    name: g.name,
    name_jp: g.name_jp,
    cover: g.cover,
    status: ['playing', 'completed', 'shelved', 'playing'][i],
    chars: (g.characters || []).slice(0, 3).map((c, j) => ({
      name: c.name,
      color: ['green', 'pink', 'gray', 'green'][j]
    }))
  }));

const RECORD_STATUS = {
  want: { label: '待游玩', color: '#A0A0A3' },
  playing: { label: '进行中', color: '#67B3DB' },
  completed: { label: '全通', color: '#DA2E53' },
  shelved: { label: '封盘', color: '#775C55' }
};
const CHAR_COLORS = { gray: '#c0c0c0', green: '#67B3DB', pink: '#D8687B' };

// 攻略示例（节选自真实 cn.md，展示小程序攻略区的视觉样式）
const GUIDE_PREAMBLE = [
  '推荐攻略顺序：尼古拉→但丁→杨→奥罗克→吉尔伯特→FINALE（隐藏、大团圆）',
  '但丁和尼古拉为一周目可攻略，通关后二周目解锁杨和奥罗克。'
];
const GUIDE_ROUTE = {
  character: '但丁',
  lines: [
    { type: 'normal', text: '已经得到了祝福（二周目后）' },
    { type: 'normal', text: '也许有迫不得已的原因（二周目后）' },
    { type: 'normal', text: '谢谢' },
    { type: 'ending', text: '【MS】想法（攻略尼古拉线后出现）' },
    { type: 'normal', text: '感谢今天' },
    { type: 'save', text: 'SAVE 1' },
    { type: 'normal', text: '为什么要把我带到这里来？' }
  ]
};

// ============ 说明方框（手机外）+ 编号标记 + 连接线 ============
const NOTES = {
  index: [
    { id: 1, title: '搜索与排序', text: '按作品名/常用简称/角色/CV查看对应作品，支持首字母/发售年份排序及题材筛选', y: 20 },
    { id: 2, title: '作品/角色百科', text: '点击标签即可切换视图', y: 36 },
    { id: 3, title: '分类合集', text: 'CV/画师/剧本/厂商合集，便捷查看对应人员参与制作的所有作品', y: 50 },
    { id: 4, title: '作品卡片标识/置顶', text: '高亮边框区分在库状态，支持最多置顶两部作品', y: 84 }
  ],
  game: [
    { id: 1, title: '基本信息', text: '整合常用简称/发行商/发售日期/平台/制作人员等信息', y: 28 },
    { id: 2, title: '故事背景与角色说明', text: '简介故事背景及可攻略角色，支持跳转角色详情及填写导出印象表', y: 56 },
    { id: 3, title: '攻略功能', text: '整合中/日双语攻略并支持导出，勾选记录进度，一键跳转最新进度', y: 85 }
  ],
  character: [
    { id: 1, title: '角色立绘整合', text: '整合角色各版本立绘', y: 25 },
    { id: 2, title: '角色基础信息', text: '角色生日链接至日历功能，提供生日提醒', y: 55 },
    { id: 3, title: '角色简介', text: '对涉及剧透的内容预先折叠处理，优化单机体验', y: 70 },
    { id: 4, title: '所属作品及标签合集', text: '支持跳转至所属作品及CV合集', y: 90 }
  ],
  cabinet: {
    cabinet: [
      { id: 1, title: '金额合计与排序', text: '对已购入卡带进行金额合计，批量管理和自定义排序', y: 12 },
      { id: 2, title: '状态筛选', text: '贴合日乙玩家游玩习惯的在库状态一键筛选', y: 36 }
    ],
    records: [
      { id: 1, title: '状态筛选', text: '贴合日乙玩家游玩习惯的游玩状态一键筛选', y: 36 },
      { id: 2, title: '角色攻略标签', text: '详情页内点击切换，以标签直观表现各线路游玩状态', y: 60 },
      { id: 3, title: '游戏repo记录', text: '记录游玩时长/起始日期/分线感想，支持文字排版导出图片', y: 82 }
    ],
    wishlist: [
      { id: 1, title: '待购清单', text: '将想购入的游戏加入心愿单，填写入库后进入游戏柜', y: 45 },
      { id: 2, title: '自定义添加', text: '未录入游戏可自定义上传封面和角色，入库后可用记录功能', y: 72 }
    ]
  },
  profile: [
    { id: 1, title: '头像与昵称', text: '云端同步自定义头像与昵称，自动填入属性图等图表中', y: 10 },
    { id: 2, title: '游戏状态统计汇总', text: '在库/游玩情况/游戏时长/金额合计简略显示', y: 28 },
    { id: 3, title: '日历', text: '角色生日及发售日期高亮，每日打卡记录游戏频率', y: 46 },
    { id: 4, title: '表格工具整合', text: '利用已整合图像资源，便捷生成社区分享常用表格', y: 66 },
    { id: 5, title: '拯救选择困难', text: '根据已有游戏/偏好进行随机选择或推荐', y: 80 },
    { id: 6, title: '亲友共填', text: '创建并分享表格码，邀请朋友共同填写同一表格', y: 92 }
  ]
};

const COLORS = {
  pink: '#D8687B',
  softPink: '#FFAFBA',
  mint: '#D7EAE7',
  blue: '#67B3DB',
  red: '#DA2E53',
  gray: '#A0A0A3',
  sub: '#A09491',
  text: '#5C5250',
  border: '#E2DBD5',
  cream: '#FFFBF2'
};

// ============ 功能说明标记（跟随手机内容滚动，悬停/点击弹出说明） ============
function FeatureNote({ id, title, lines }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="fn"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      <span className="fn-badge">{id}</span>
      {open && (
        <span className="fn-pop">
          <b>{title}</b>
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </span>
      )}
    </span>
  );
}

// ============ 底部标签栏 ============
function Tabbar({ active }) {
  const tabs = ['索引', '我的游戏', '我的'];
  const keys = ['index', 'cabinet', 'profile'];
  return (
    <div className="mp-tabbar">
      {tabs.map((t, i) => (
        <span key={t} className={active === keys[i] ? 'is-active' : ''}>
          {t}
        </span>
      ))}
    </div>
  );
}

// ============ 手机壳 ============
export function PhoneFrame({ tab, footer, children }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="mp-statusbar">
          <span>9:41</span>
          <span className="mp-status-icons">📶 ▂▄▆ 🔋</span>
        </div>
        <div className="mp-scroll">{children}</div>
        {footer != null ? footer : tab ? <Tabbar active={tab} /> : null}
      </div>
    </div>
  );
}

// ============ 说明方框：手机 + 编号 + 连接线 ============
function AnnotatedPhone({ notes, title, children }) {
  return (
    <div className="mp-mock">
      <div className="mp-phone-col">
        {children}
        {notes.map((n) => (
          <span className="mp-dot" style={{ top: `${n.y}%` }} key={n.id}>
            {n.id}
          </span>
        ))}
      </div>
      <div className="mp-leads">
        {notes.map((n) => (
          <span className="mp-lead" style={{ top: `${n.y}%` }} key={n.id} />
        ))}
      </div>
      <div className="mp-notes">
        <div className="mp-note-title">{title}</div>
        {notes.map((n) => (
          <div className="mp-note" style={{ top: `${n.y}%` }} key={n.id}>
            <span className="mp-note-num">{n.id}</span>
            <div className="mp-note-body">
              <b>{n.title}</b>
              <p>{n.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ 索引页 ============
export function IndexPage() {
  const [mode, setMode] = useState('games');
  return (
    <div className="mp-app">
      <div className="mpi-title">
        <b>乙手记-my otome logs-</b>
        <span>个人乙游记录工具</span>
      </div>
      <div className="mpi-search">
        <span className="mpi-search-ico">⌕</span>
        <span className="mpi-search-ph">搜索作品/简称/角色/CV...</span>
      </div>
      <div className="mpi-actions">
        <span className="mpi-btn">排序 ▾</span>
        <span className="mpi-btn">筛选 ▾</span>
        <span className="mpi-count">{mode === 'games' ? INDEX_GAMES.length : SAMPLE_CHARS.length} 项</span>
      </div>

      <div className="mpi-toggle">
        <span className={mode === 'games' ? 'is-active' : ''} onClick={() => setMode('games')}>
          作品
        </span>
        <span className={mode === 'characters' ? 'is-active' : ''} onClick={() => setMode('characters')}>
          角色
        </span>
      </div>

      <div className="mpi-collections">
        <div className="mpi-coll" style={{ borderTopColor: COLORS.mint }}>
          <b>CV合集</b>
        </div>
        <div className="mpi-coll" style={{ borderTopColor: COLORS.softPink }}>
          <b>画师合集</b>
        </div>
        <div className="mpi-coll" style={{ borderTopColor: COLORS.mint }}>
          <b>剧本/监制</b>
        </div>
        <div className="mpi-coll" style={{ borderTopColor: COLORS.border }}>
          <b>厂商合集</b>
        </div>
      </div>

      {mode === 'games' ? (
        <div className="mpi-game-list">
          {INDEX_GAMES.map((g, i) => (
            <div
              className="mpi-game-card"
              key={g.id}
              style={{
                boxShadow: `inset 0 0 0 5px ${
                  g.status === 'in' ? COLORS.blue : g.status === 'out' ? COLORS.red : COLORS.gray
                }`
              }}
            >
              <img src={g.cover} alt={g.name} loading="lazy" />
              <div className="mpi-game-info">
                <b>{g.name}</b>
                <span className="mpi-game-jp">{g.name_jp}</span>
                <div className="mpi-game-tags">
                  {g.tags.map((t) => (
                    <em key={t}>{t}</em>
                  ))}
                </div>
              </div>
              <span className="mpi-pin">置顶</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mpi-char-grid">
          {SAMPLE_CHARS.map((c) => (
            <div className="mpi-char-card" key={c.name + c.cv}>
              <img src={c.avatar} alt={c.name} loading="lazy" />
              <b>{c.name}</b>
              {c.cv && <span>{c.cv}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ 作品详情页（虔诚之花的晚钟-ricordo-） ============
export function GameDetailPage() {
  const [guideLang, setGuideLang] = useState('cn');
  const [expanded, setExpanded] = useState(true);

  const infoRows = [
    { label: '作品名', chips: null, text: GAME.name },
    { label: '常用简称', chips: GAME.name_cn_alt || [], text: null },
    { label: '发行商', chips: GAME.company || [], text: null },
    { label: '发售日期', chips: null, text: (GAME.release_year || []).join(' / ') },
    { label: '平台', chips: null, text: (GAME.platform || []).join(' / ') },
    { label: '监制/制作人', chips: GAME.director || [], text: null },
    { label: '剧本', chips: GAME.writer || [], text: null },
    { label: '原画', chips: GAME.illustrator || [], text: null },
    { label: '出演CV', chips: GAME.cv_list || [], text: null }
  ];

  const routeChars = ['但丁', '吉尔伯特', '杨', '尼古拉', '奥罗克', '经理人'];
  const subChars = ['Leo', 'Roberto', 'Emilio', 'Elena'];
  const routeable = GAME.characters.filter((c) => routeChars.includes(c.name));
  const subs = GAME.characters.filter((c) => subChars.includes(c.name));

  return (
    <div className="mp-app mp-app-full">
      {/* 封面横幅 */}
      <div className="mpg-banner">
        <img className="mpg-banner-bg" src={GAME.cover} alt="" />
        <div className="mpg-banner-overlay" />
        <div className="mpg-banner-text">
          <b>{GAME.name}</b>
          <span>{GAME.name_jp}</span>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="mpg-card">
        <h3 className="mpg-h">基本信息</h3>
        {infoRows.map((r) => (
          <div className="mpg-row" key={r.label}>
            <span className="mpg-label">{r.label}</span>
            {r.chips ? (
              <div className="mpg-chips">
                {r.chips.map((c) => (
                  <em key={c}>{c}</em>
                ))}
              </div>
            ) : (
              <span className="mpg-value">{r.text}</span>
            )}
          </div>
        ))}
        <div className="mpg-row">
          <span className="mpg-label">官网</span>
          <span className="mpg-value mpg-link">{GAME.official_site}</span>
        </div>
      </div>

      {/* 故事背景 */}
      <div className="mpg-card">
        <h3 className="mpg-h">故事背景</h3>
        <p className="mpg-story">{GAME.story}</p>
        <div className="mpg-tags">
          {GAME.tags.map((t) => (
            <em key={t}>{t}</em>
          ))}
        </div>
      </div>

      {/* 主要角色 */}
      <div className="mpg-card">
        <div className="mpg-head">
          <h3 className="mpg-h mpg-h-noborder">主要角色</h3>
          <span className="mpg-impression">生成印象表</span>
        </div>
        <div className="mpg-char-scroll">
          {[...routeable, ...subs].map((c) => {
            const isSub = subChars.includes(c.name);
            return (
              <div className="mpg-char" key={c.name}>
                <img src={c.avatar} alt={c.name} loading="lazy" />
                <b style={{ color: isSub ? '#b0b0b0' : '#333' }}>{c.name}</b>
                <span style={{ color: isSub ? '#c0c0c0' : '#b0b0b0' }}>{c.cv || ''}</span>
              </div>
            );
          })}
        </div>
        <p className="mpg-nonroute">* 灰色字体角色为非正式可攻略角色，为避免剧透不详细说明，请自行游玩后确认。</p>
      </div>

      {/* 攻略 */}
      <div className="mpg-card">
        <div className="mpg-head mpg-guide-head">
          <div className="mpg-head-left">
            <h3 className="mpg-h mpg-h-noborder">攻略</h3>
            <div className="mpg-guide-actions">
              <span>跳到进度</span>
              <span className="is-dim">清除标记</span>
              <span className="is-solid">导出排版</span>
            </div>
          </div>
          <div className="mpg-lang">
            <span className={guideLang === 'cn' ? 'is-active' : ''} onClick={() => setGuideLang('cn')}>
              繁中
            </span>
            <span className={guideLang === 'jp' ? 'is-active' : ''} onClick={() => setGuideLang('jp')}>
              日版
            </span>
          </div>
        </div>

        <div className="mpg-guide">
          {GUIDE_PREAMBLE.map((t, i) => (
            <p className="mpg-guide-suggestion" key={i}>
              {t}
            </p>
          ))}

          <div className="mpg-guide-route" onClick={() => setExpanded(!expanded)}>
            <span>{GUIDE_ROUTE.character}</span>
            <span>{expanded ? '▼' : '▶'}</span>
          </div>

          {expanded && (
            <div className="mpg-guide-lines">
              {GUIDE_ROUTE.lines.map((l, i) => (
                <div className="mpg-guide-line" key={i}>
                  <span className="mpg-mark" />
                  <span
                    className={
                      l.type === 'save'
                        ? 'mpg-line mpg-line-save'
                        : l.type === 'ending'
                        ? 'mpg-line mpg-line-ending'
                        : 'mpg-line'
                    }
                  >
                    {l.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ 角色详情页（但丁） ============
export function CharacterDetailPage() {
  const [fav, setFav] = useState(true);
  const [introOpen, setIntroOpen] = useState(false);

  const profileRows = [
    { label: '出生日期', value: '9月17日' },
    { label: '年龄', value: '23岁' },
    { label: '身高', value: '178cm' }
  ];

  return (
    <div className="mp-app mp-app-full">
      {/* 头像横幅 */}
      <div className="mpc2-banner">
        <img className="mpc2-banner-bg" src={DANTE.avatar} alt="" />
        <div className="mpc2-banner-overlay" />
        <button className="mpc2-fav" onClick={() => setFav(!fav)}>
          {fav ? '★' : '☆'}
        </button>
        <div className="mpc2-banner-text">
          <b>{DANTE.name}</b>
          <span>{DANTE.name_jp}</span>
          <em>CV: {DANTE.cv}</em>
        </div>
      </div>

      {/* 角色立绘 */}
      <div className="mpg-card">
        <h3 className="mpg-h">角色立绘</h3>
        <div className="mpc2-illus">
          <span className="mpc2-illus-game">虔诚之花的晚钟-ricordo-</span>
          <div className="mpc2-illus-box">
            <img src="assets/games/game_1925/characters/illust_1.png" alt="但丁立绘" />
          </div>
        </div>
      </div>

      {/* 角色信息 */}
      <div className="mpg-card">
        <h3 className="mpg-h">角色信息</h3>
        {profileRows.map((r, i) => (
          <div className="mpc2-profile-row" style={{ background: i % 2 === 0 ? 'rgba(255,175,186,0.12)' : 'transparent' }} key={r.label}>
            <span className="mpc2-profile-label">{r.label}</span>
            <span className="mpc2-profile-value">{r.value}</span>
          </div>
        ))}
      </div>

      {/* 角色简介 */}
      <div className="mpg-card">
        <h3 className="mpg-h">角色简介</h3>
        <p className="mpc2-spoiler">*FD角色介绍可能存在本篇剧情的剧透，谨慎展开</p>
        {introOpen && (
          <p className="mpc2-intro">
            但丁·法尔宗，法尔宗家族的首领。虽然很年轻，却是自幼接受英才教育的正统继承人。5年前父亲去世时，继承了首领之位。绝大多数时候看上去很冷漠，但对待自己人却很重感情，也会照顾人。十分重视血统和传统。
          </p>
        )}
        <button className="mpc2-intro-toggle" onClick={() => setIntroOpen(!introOpen)}>
          {introOpen ? '收起 ▲' : '展开 ▼'}
        </button>
      </div>

      {/* 所属作品 */}
      <div className="mpg-card">
        <h3 className="mpg-h">所属作品</h3>
        <div className="mpc2-game-link">
          <img src={GAME.cover} alt="" />
          <div className="mpc2-game-name">
            <b>{GAME.name}</b>
          </div>
          <span className="mpc2-arrow">›</span>
        </div>
      </div>

      {/* 标签合集 */}
      <div className="mpg-card">
        <h3 className="mpg-h">标签合集</h3>
        <div className="mpc2-tags">
          <em>CV: {DANTE.cv}</em>
        </div>
      </div>
    </div>
  );
}

// ============ 我的游戏页 ============
export function CabinetPage({ mode, onModeChange }) {
  const [showAmount, setShowAmount] = useState(false);

  const statusMeta = {
    in: { label: '在库', color: COLORS.blue },
    out: { label: '已出', color: COLORS.red },
    lent: { label: '外借', color: COLORS.gray },
    pending: { label: '待入库', color: '#b0b0b0' }
  };

  return (
    <div className="mp-app">
      {/* 头部 */}
      <div className="mpc-header">
        <div className="mpc-header-left">
          <b>我的游戏</b>
          <span>{CABINET_GAMES.length} 部</span>
        </div>
        <div className="mpc-header-right">
          <span className="mpc-chip" onClick={() => setShowAmount(!showAmount)}>
            {showAmount ? '¥1,008' : '***'} {showAmount ? '👁️' : '👁️‍🗨️'}
          </span>
          <span className="mpc-chip">管理</span>
          <span className="mpc-chip">排序</span>
        </div>
      </div>

      {/* 模式切换 */}
      <div className="mpc-toggle">
        <span className={mode === 'cabinet' ? 'is-active' : ''} onClick={() => onModeChange('cabinet')}>
          游戏柜
        </span>
        <span className={mode === 'records' ? 'is-active' : ''} onClick={() => onModeChange('records')}>
          游戏记录
        </span>
        <span className={mode === 'wishlist' ? 'is-active' : ''} onClick={() => onModeChange('wishlist')}>
          心愿单
        </span>
      </div>

      {/* 搜索 */}
      <div className="mpc-search">
        <span className="mpi-search-ico">⌕</span>
        <span className="mpi-search-ph">搜索游戏...</span>
      </div>

      {/* 状态筛选 */}
      {mode === 'cabinet' && (
        <div className="mpc-filters">
          <span className="is-active">全部</span>
          <span>在库</span>
          <span>已出</span>
          <span>外借</span>
        </div>
      )}
      {mode === 'records' && (
        <div className="mpc-filters">
          <span className="is-active">全部</span>
          <span>待游玩</span>
          <span>进行中</span>
          <span>全通</span>
          <span>封盘</span>
        </div>
      )}

      {/* 游戏柜 */}
      {mode === 'cabinet' && (
        <div className="mpc-grid">
          {CABINET_GAMES.map((g) => (
            <div className="mpc-grid-item" key={g.id}>
              <div className="mpc-grid-cover">
                <img src={g.cover} alt={g.name} loading="lazy" />
              </div>
              <b className="mpc-grid-name">{g.name}</b>
              <div className="mpc-grid-meta">
                <span className="mpc-status" style={{ background: statusMeta[g.status].color }}>
                  {statusMeta[g.status].label}
                </span>
                <span className="mpc-price">{g.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 游戏记录 */}
      {mode === 'records' && (
        <div className="mpc-list">
          {RECORD_GAMES.map((g, i) => (
            <div
              className="mpc-row mpc-record"
              key={g.id}
              style={{ boxShadow: `inset 0 0 0 4px ${RECORD_STATUS[g.status].color}, 0 4px 16px rgba(103,179,219,0.10)` }}
            >
              <img className="mpc-cover" src={g.cover} alt={g.name} loading="lazy" />
              <div className="mpc-info">
                <b>{g.name}</b>
                <span>{g.name_jp}</span>
                <div className="mpc-chars">
                  {g.chars.map((ch) => (
                    <em key={ch.name} style={{ background: CHAR_COLORS[ch.color] }}>
                      {ch.name}
                    </em>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 心愿单 */}
      {mode === 'wishlist' && (
        <div className="mpc-list">
          {CABINET_GAMES.slice(0, 3).map((g, i) => (
            <div className="mpc-row" key={g.id}>
              <img className="mpc-cover" src={g.cover} alt={g.name} loading="lazy" />
              <div className="mpc-info">
                <b>{g.name}</b>
                <span>{g.name_jp}</span>
              </div>
              <div className="mpc-wish-btns">
                <span className="is-solid">入库</span>
                <span className="is-outline">移除</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ 我的页 ============
export function ProfilePage() {
  const STATS = [
    { n: '128', label: '在库', color: COLORS.blue },
    { n: '86', label: '全通', color: COLORS.red },
    { n: '12', label: '进行中', color: COLORS.blue },
    { n: '30', label: '封盘', color: '#775C55' }
  ];
  const TOOL_ROWS = [
    ['Tiermaker', '盲狙表'],
    ['角色偏好表', 'CV偏好表'],
    ['角色九宫格', '作品九宫格'],
    ['Repo表格', '自定义表格'],
    ['我的属性', '拯救选择困难']
  ];
  const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  const CAL_DAYS = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    pink: [3, 9, 15, 22].includes(i + 1),
    blue: [5, 18].includes(i + 1)
  }));

  return (
    <div className="mp-app">
      <div className="mp-app-header">
        <img className="mp-avatar-img" src="assets/common/kinmokusei.png" alt="头像" />
        <div className="mp-nick">遇</div>
        <div className="mp-sync">数据已同步 · 可跨设备使用</div>
      </div>

      <div className="mp-stats">
        {STATS.map((s) => (
          <div className="mp-stat" style={{ borderColor: s.color }} key={s.label}>
            <b style={{ color: s.color }}>{s.n}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mp-summary">
        <div className="mp-summary-item" style={{ borderColor: COLORS.blue }}>
          <b>1,234h</b>
          <span>合计游戏时长</span>
        </div>
        <div className="mp-summary-item" style={{ borderColor: COLORS.pink }}>
          <b>¥8,888</b>
          <span>合计花费金额</span>
          <em className="mp-summary-link">记账 ›</em>
        </div>
      </div>

      <div className="mp-cal">
        <div className="mp-cal-head">
          <span className="mp-cal-nav">◀</span>
          <b>2026年8月</b>
          <span className="mp-cal-nav">▶</span>
        </div>
        <div className="mp-cal-week">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mp-cal-grid">
          {CAL_DAYS.map((c) => (
            <div className="mp-cal-day" key={c.day}>
              {c.day}
              {(c.pink || c.blue) && (
                <span className="mp-cal-dots">
                  {c.pink && <i className="dot-pink" />}
                  {c.blue && <i className="dot-blue" />}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mp-checkin">今日游玩打卡！</div>

      {TOOL_ROWS.map((row, ri) => (
        <div className="mp-tools" key={row[0]}>
          {row.map((t, ti) => (
            <div className="mp-tool" key={t}>
              {t}
            </div>
          ))}
        </div>
      ))}

      <div className="mp-share">亲友共填</div>
      <div className="mp-settings">设置</div>
    </div>
  );
}

// ============ 底部操作条（作品详情页） ============
function GameActionBar() {
  return (
    <div className="mpg-actionbar">
      <span className="is-gray">加入心愿单</span>
      <span className="is-pink">入柜</span>
    </div>
  );
}

// ============ 左右滑动切换的手机轮播 ============
export function PhoneCarousel() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const [cabinetMode, setCabinetMode] = useState('cabinet');
  const labels = ['索引', '作品详情', '角色详情', '我的游戏', '我的'];

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[i];
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  const goNext = () => scrollTo((active + 1) % labels.length);
  const goPrev = () => scrollTo((active - 1 + labels.length) % labels.length);

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const slides = track.children;
    const center = track.scrollLeft + track.clientWidth / 2;
    let idx = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].offsetLeft <= center && slides[i].offsetLeft + slides[i].offsetWidth > center) {
        idx = i;
        break;
      }
    }
    setActive(idx);
  };

  return (
    <div className="mp-carousel">
      <div className="mp-dots">
        {labels.map((label, i) => (
          <button key={label} className={active === i ? 'is-active' : ''} onClick={() => scrollTo(i)}>
            {label}
          </button>
        ))}
      </div>
      <div className="mp-carousel-track" ref={trackRef} onScroll={onScroll}>
        <div className="mp-slide">
          <AnnotatedPhone notes={NOTES.index} title="索引">
            <PhoneFrame tab="index">
              <IndexPage />
            </PhoneFrame>
          </AnnotatedPhone>
        </div>
        <div className="mp-slide">
          <AnnotatedPhone notes={NOTES.game} title="作品详情">
            <PhoneFrame footer={<GameActionBar />}>
              <GameDetailPage />
            </PhoneFrame>
          </AnnotatedPhone>
        </div>
        <div className="mp-slide">
          <AnnotatedPhone notes={NOTES.character} title="角色详情">
            <PhoneFrame>
              <CharacterDetailPage />
            </PhoneFrame>
          </AnnotatedPhone>
        </div>
        <div className="mp-slide">
          <AnnotatedPhone notes={NOTES.cabinet[cabinetMode]} title="我的游戏">
            <PhoneFrame tab="cabinet">
              <CabinetPage mode={cabinetMode} onModeChange={setCabinetMode} />
            </PhoneFrame>
          </AnnotatedPhone>
        </div>
        <div className="mp-slide">
          <AnnotatedPhone notes={NOTES.profile} title="我的">
            <PhoneFrame tab="profile">
              <ProfilePage />
            </PhoneFrame>
          </AnnotatedPhone>
        </div>
      </div>

      <button className="mp-arrow mp-arrow-left" onClick={goPrev} aria-label="上一页">
        ‹
      </button>
      <button className="mp-arrow mp-arrow-right" onClick={goNext} aria-label="下一页">
        ›
      </button>
    </div>
  );
}

export default function MiniProgram() {
  return <PhoneCarousel />;
}
