import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCurrentSessionId,
  startClickTracking,
  trackPageView,
} from './tracker.js';

const API = import.meta.env.VITE_API_URL || '';

function formatTime(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function DemoPage() {
  const [notice, setNotice] = useState('');

  useEffect(() => {
    trackPageView();
    return startClickTracking();
  }, []);

  const products = [
    { number: '01', name: 'The Sunday cup', price: '$28', style: 'cup' },
    { number: '02', name: 'Soft form vase', price: '$64', style: 'vase-product' },
    { number: '03', name: 'Loom table cloth', price: '$78', style: 'cloth' },
  ];

  return (
    <main className="demo-page">
      <nav className="demo-nav">
        <a className="wordmark" href="#top">
          fieldnotes<span>.</span>
        </a>
        <div>
          <a href="#story">Our story</a>
          <a href="#collection">Collection</a>
          <a href="#footer">Contact</a>
        </div>
        <span className="bag">Bag (0)</span>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">MADE FOR SLOWER MORNINGS</p>
          <h1>A little more room for the everyday.</h1>
          <p>
            Thoughtful objects for a home that feels like yours. Made in small
            batches with makers we love.
          </p>
          <a className="dark-button" href="#collection">
            Explore the collection <span>↗</span>
          </a>
        </div>

        <div className="hero-art">
          <div className="sun" />
          <div className="vase vase-one" />
          <div className="vase vase-two" />
          <div className="linen" />
          <span className="art-caption">
            Objects with a softer story · 01 / 04
          </span>
        </div>
      </section>

      <section className="story" id="story">
        <span className="eyebrow">A NOTE FROM US</span>
        <p>
          Good design doesn’t ask for attention. It makes the small moments feel
          a little more considered.
        </p>
      </section>

      <section className="collection" id="collection">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE EVERYDAY EDIT</span>
            <h2>Keep close.</h2>
          </div>
          <span>01 — 03</span>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <button
              className="product"
              key={product.number}
              onClick={() =>
                setNotice(`${product.name} added to your favorites`)
              }
            >
              <div className={`product-art ${product.style}`}>
                <span className="product-number">{product.number}</span>
                <span className="plus">+</span>
              </div>
              <div className="product-info">
                <span>{product.name}</span>
                <span>{product.price}</span>
              </div>
            </button>
          ))}
        </div>

        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
      </section>

      <footer id="footer">
        <span className="wordmark">
          fieldnotes<span>.</span>
        </span>
        <span>Made slowly, for living fully.</span>
        <span>© 2026 Fieldnotes Studio</span>
      </footer>

      <div className="session-badge">
        DEMO SESSION <code>{getCurrentSessionId().slice(0, 8)}</code> · clicks
        are being tracked
      </div>
    </main>
  );
}

function Heatmap({ clicks }) {
  const largestViewportSide = clicks.reduce(
    (largest, click) =>
      Math.max(largest, click.viewportWidth || 1, click.viewportHeight || 1),
    0,
  );

  return (
    <div className="heatmap-stage">
      <div className="heatmap-browser">
        <div className="browser-bar">
          <i />
          <i />
          <i />
          <span>Page interaction map</span>
        </div>

        <div className="heatmap-page">
          <div className="heatmap-topline" />
          <div className="heatmap-title" />
          <div className="heatmap-subtitle" />
          <div className="heatmap-cta" />
          <div className="heatmap-image" />
          <div className="heatmap-copy" />

          <div className="heatmap-grid">
            {clicks.map((click, index) => {
              const width = click.viewportWidth || largestViewportSide || 1;
              const height = click.viewportHeight || largestViewportSide || 1;
              const left = Math.min(100, Math.max(0, (click.x / width) * 100));
              const top = Math.min(100, Math.max(0, (click.y / height) * 100));

              return (
                <span
                  key={click._id || index}
                  className="heat-dot"
                  title={`${Math.round(click.x)}, ${Math.round(click.y)}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="heatmap-caption">
        {clicks.length} click{clicks.length === 1 ? '' : 's'} · dots mark
        viewport positions
      </p>
    </div>
  );
}

function SessionList({
  sessions,
  selectedSession,
  loading,
  onSelectSession,
}) {
  return (
    <section className="panel sessions-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">VISITOR ACTIVITY</span>
          <h2>Sessions</h2>
        </div>
        <span className="count-pill">{sessions.length} total</span>
      </div>

      <div className="session-list">
        {loading && <div className="empty-state">Loading sessions…</div>}

        {!loading && sessions.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">↗</span>
            <strong>No sessions yet</strong>
            <p>Open the demo page and click around to start collecting events.</p>
          </div>
        )}

        {sessions.map((session) => (
          <button
            key={session.sessionId}
            className={`session-row ${
              selectedSession === session.sessionId ? 'selected' : ''
            }`}
            onClick={() => onSelectSession(session.sessionId)}
          >
            <span className="avatar">
              {session.sessionId.slice(0, 2).toUpperCase()}
            </span>
            <span className="session-details">
              <strong>{session.sessionId.slice(0, 18)}…</strong>
              <small>Last seen {formatTime(session.lastSeen)}</small>
            </span>
            <span className="event-count">{session.eventCount} events</span>
            <span className="row-arrow">↗</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function UserJourney({ selectedSession, events }) {
  return (
    <section className="panel journey-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">SESSION DETAIL</span>
          <h2>User journey</h2>
        </div>
        {selectedSession && (
          <span className="count-pill">{events.length} events</span>
        )}
      </div>

      {!selectedSession ? (
        <div className="empty-state">
          <span className="empty-icon">◎</span>
          <strong>Select a session</strong>
          <p>Choose a session to see its event timeline.</p>
        </div>
      ) : (
        <div className="timeline">
          {events.map((event) => (
            <article className="timeline-event" key={event._id}>
              <span className={`event-dot ${event.type}`} />
              <div>
                <div className="event-title">
                  <strong>
                    {event.type === 'page_view' ? 'Viewed page' : 'Clicked'}
                  </strong>
                  <time>{formatTime(event.timestamp)}</time>
                </div>
                <p className="event-url">{event.pageUrl}</p>
                {event.type === 'click' && (
                  <small className="coordinates">
                    Position · {Math.round(event.x)}, {Math.round(event.y)}
                  </small>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function HeatmapPanel({ pages, selectedPage, clicks, onSelectPage }) {
  return (
    <section className="panel heatmap-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">CLICK DISTRIBUTION</span>
          <h2>Page heatmap</h2>
          <p className="panel-subtitle">
            See where visitors interact on a page.
          </p>
        </div>

        <label className="select-wrap">
          PAGE URL
          <select
            value={selectedPage}
            onChange={(event) => onSelectPage(event.target.value)}
            disabled={!pages.length}
          >
            <option value="">
              {pages.length ? 'Choose a page' : 'No pages yet'}
            </option>
            {pages.map((page) => (
              <option value={page} key={page}>
                {page}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedPage ? (
        <Heatmap clicks={clicks} />
      ) : (
        <div className="empty-state heatmap-empty">
          <span className="empty-icon">⌖</span>
          <strong>No page data yet</strong>
          <p>Visit the demo page to record views and clicks.</p>
        </div>
      )}
    </section>
  );
}

function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [events, setEvents] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [sessionResponse, pageResponse] = await Promise.all([
        fetch(`${API}/api/sessions`),
        fetch(`${API}/api/pages`),
      ]);

      if (!sessionResponse.ok || !pageResponse.ok) {
        throw new Error('Could not load analytics data. Is the API running?');
      }

      const [sessionData, pageData] = await Promise.all([
        sessionResponse.json(),
        pageResponse.json(),
      ]);

      setSessions(sessionData);
      setPages(pageData);
      setSelectedSession((currentSession) =>
        currentSession &&
        sessionData.some((session) => session.sessionId === currentSession)
          ? currentSession
          : sessionData[0]?.sessionId || '',
      );
      setSelectedPage((currentPage) =>
        currentPage && pageData.includes(currentPage)
          ? currentPage
          : pageData[0] || '',
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedSession) {
      setEvents([]);
      return;
    }

    fetch(`${API}/api/sessions/${encodeURIComponent(selectedSession)}/events`)
      .then((response) => response.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  }, [selectedSession]);

  useEffect(() => {
    if (!selectedPage) {
      setClicks([]);
      return;
    }

    fetch(`${API}/api/clicks?pageUrl=${encodeURIComponent(selectedPage)}`)
      .then((response) => response.json())
      .then(setClicks)
      .catch(() => setClicks([]));
  }, [selectedPage]);

  const totalEvents = useMemo(
    () => sessions.reduce((total, session) => total + session.eventCount, 0),
    [sessions],
  );

  return (
    <main className="dashboard">
      <header className="dash-header">
        <a className="dash-logo" href="#">
          trailhead<span> / </span>analytics
        </a>
        <div className="live-label">
          <i /> LIVE DATA
        </div>
      </header>

      <section className="dash-intro">
        <div>
          <span className="eyebrow">BEHAVIOR OVERVIEW</span>
          <h1>
            Know the paths
            <br />
            people take.
          </h1>
          <p>A clear view of how visitors move through your experience.</p>
        </div>
        <button className="refresh-button" onClick={refresh}>
          ↻ <span>Refresh data</span>
        </button>
      </section>

      {error && (
        <div className="error-banner">
          {error} <button onClick={refresh}>Retry</button>
        </div>
      )}

      <section className="metric-row">
        <article className="metric-card">
          <span>Tracked sessions</span>
          <strong>{sessions.length}</strong>
          <small>Unique browser sessions</small>
        </article>
        <article className="metric-card">
          <span>Events captured</span>
          <strong>{totalEvents}</strong>
          <small>Page views and clicks</small>
        </article>
        <article className="metric-card">
          <span>Pages observed</span>
          <strong>{pages.length}</strong>
          <small>Distinct page URLs</small>
        </article>
        <article className="metric-card accent-card">
          <span>Collection status</span>
          <strong>
            <i /> Collecting
          </strong>
          <small>Events arrive in real time</small>
        </article>
      </section>

      <div className="dash-grid">
        <SessionList
          sessions={sessions}
          selectedSession={selectedSession}
          loading={loading}
          onSelectSession={setSelectedSession}
        />
        <UserJourney selectedSession={selectedSession} events={events} />
      </div>

      <HeatmapPanel
        pages={pages}
        selectedPage={selectedPage}
        clicks={clicks}
        onSelectPage={setSelectedPage}
      />

      <footer className="dash-footer">
        <span>TRAILHEAD ANALYTICS · ASSIGNMENT DEMO</span>
        <a href="/demo">Open demo storefront ↗</a>
      </footer>
    </main>
  );
}

export default function App() {
  const isDemoPage = window.location.pathname === '/demo';

  return isDemoPage ? <DemoPage /> : <Dashboard />;
}
