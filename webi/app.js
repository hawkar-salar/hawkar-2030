"use strict";
/* =====================================================================
   HAWKAR SALAR MUSTAFA — Portfolio interactivity
   Compiled to js/app.js via `tsc`. No frameworks, no dependencies.
   ===================================================================== */
/* ---------------------------------------------------------------------
   1. Mobile nav toggle
   --------------------------------------------------------------------- */
function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navlinks');
    if (!toggle || !links)
        return;
    toggle.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });
    links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}
/* ---------------------------------------------------------------------
   2. Scrollspy — highlight active nav link
   --------------------------------------------------------------------- */
function initScrollSpy() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.navlinks a'));
    if (!sections.length || !navLinks.length)
        return;
    const linkFor = (id) => navLinks.find((l) => l.getAttribute('href') === `#${id}`);
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const id = entry.target.id;
            const link = linkFor(id);
            if (!link)
                return;
            if (entry.isIntersecting) {
                navLinks.forEach((l) => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach((s) => observer.observe(s));
}
/* ---------------------------------------------------------------------
   3. Reveal-on-scroll for .reveal elements
   --------------------------------------------------------------------- */
function initRevealOnScroll() {
    const targets = Array.from(document.querySelectorAll('.reveal'));
    if (!targets.length)
        return;
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    targets.forEach((t, i) => {
        // slight stagger for cards that share a row
        t.style.transitionDelay = `${(i % 4) * 60}ms`;
        observer.observe(t);
    });
}
/* ---------------------------------------------------------------------
   4. Animate skill meters + cert progress bars once visible
   --------------------------------------------------------------------- */
function initMeters() {
    const meters = Array.from(document.querySelectorAll('.meter'));
    const certBars = Array.from(document.querySelectorAll('.cert-bar-fill'));
    const fillOne = (el, targetEl) => {
        const value = el.getAttribute('data-value') || '0';
        requestAnimationFrame(() => {
            targetEl.style.width = `${value}%`;
        });
    };
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting)
                return;
            const el = entry.target;
            if (el.classList.contains('meter')) {
                const fill = el.querySelector('.meter-fill');
                if (fill)
                    fillOne(el, fill);
            }
            else if (el.classList.contains('cert-bar-fill')) {
                fillOne(el, el);
            }
            obs.unobserve(el);
        });
    }, { threshold: 0.4 });
    meters.forEach((m) => observer.observe(m));
    certBars.forEach((c) => observer.observe(c));
}
/* ---------------------------------------------------------------------
   5. Hero network topology — generated SVG with traveling packets
   --------------------------------------------------------------------- */
function buildTopology() {
    const svg = document.getElementById('topoSvg');
    if (!svg)
        return;
    const linksGroup = document.getElementById('topoLinks');
    const nodesGroup = document.getElementById('topoNodes');
    const packetsGroup = document.getElementById('topoPackets');
    if (!linksGroup || !nodesGroup || !packetsGroup)
        return;
    const NS = 'http://www.w3.org/2000/svg';
    const nodes = [
        { id: 'core', x: 200, y: 200, label: 'HSM', core: true },
        { id: 'route', x: 200, y: 60, label: 'Routing & Switching' },
        { id: 'auto', x: 340, y: 130, label: 'Automation' },
        { id: 'linux', x: 350, y: 280, label: 'Linux' },
        { id: 'py', x: 220, y: 350, label: 'Python' },
        { id: 'sec', x: 70, y: 290, label: 'Security' },
        { id: 'web', x: 55, y: 140, label: 'Web Dev' },
    ];
    const links = [
        { from: 'core', to: 'route' },
        { from: 'core', to: 'auto' },
        { from: 'core', to: 'linux' },
        { from: 'core', to: 'py' },
        { from: 'core', to: 'sec' },
        { from: 'core', to: 'web' },
    ];
    const nodeById = (id) => nodes.find((n) => n.id === id);
    // draw links
    links.forEach((link) => {
        const a = nodeById(link.from);
        const b = nodeById(link.to);
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', String(a.x));
        line.setAttribute('y1', String(a.y));
        line.setAttribute('x2', String(b.x));
        line.setAttribute('y2', String(b.y));
        line.setAttribute('class', 'topo-link live');
        linksGroup.appendChild(line);
    });
    // draw nodes
    nodes.forEach((node) => {
        const g = document.createElementNS(NS, 'g');
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', String(node.x));
        circle.setAttribute('cy', String(node.y));
        circle.setAttribute('r', node.core ? '26' : '15');
        circle.setAttribute('class', `topo-node${node.core ? ' core' : ''}`);
        g.appendChild(circle);
        if (node.core) {
            const inner = document.createElementNS(NS, 'circle');
            inner.setAttribute('cx', String(node.x));
            inner.setAttribute('cy', String(node.y));
            inner.setAttribute('r', '3.5');
            inner.setAttribute('class', 'topo-dot');
            g.appendChild(inner);
        }
        const label = document.createElementNS(NS, 'text');
        label.setAttribute('x', String(node.x));
        label.setAttribute('y', String(node.y + (node.core ? 44 : 30)));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', `topo-label${node.core ? ' core' : ''}`);
        label.textContent = node.label;
        g.appendChild(label);
        nodesGroup.appendChild(g);
    });
    // animated packets traveling from core to each leaf, staggered
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion) {
        links.forEach((link, i) => {
            const a = nodeById(link.from);
            const b = nodeById(link.to);
            const packet = document.createElementNS(NS, 'circle');
            packet.setAttribute('r', '3.2');
            packet.setAttribute('class', 'topo-packet');
            const animate = document.createElementNS(NS, 'animateMotion');
            animate.setAttribute('dur', `${2.6 + i * 0.35}s`);
            animate.setAttribute('repeatCount', 'indefinite');
            animate.setAttribute('begin', `${i * 0.4}s`);
            animate.setAttribute('path', `M${a.x},${a.y} L${b.x},${b.y} L${a.x},${a.y}`);
            packet.appendChild(animate);
            packetsGroup.appendChild(packet);
        });
    }
}
/* ---------------------------------------------------------------------
   6. Ping / contact form — client-side simulated "ping" response
   --------------------------------------------------------------------- */
function initPingForm() {
    const form = document.getElementById('pingForm');
    const output = document.getElementById('pingOutput');
    if (!form || !output)
        return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameEl = document.getElementById('fname');
        const emailEl = document.getElementById('femail');
        const msgEl = document.getElementById('fmsg');
        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const message = msgEl.value.trim();
        if (!name || !email || !message) {
            output.classList.remove('ok');
            output.textContent = 'request timed out: please fill in every field.';
            return;
        }
        output.textContent = `PING ${email}: 3 packets transmitted...`;
        let count = 0;
        const total = 3;
        const timer = window.setInterval(() => {
            count += 1;
            output.textContent = `PING ${email}: seq=${count} time=${(8 + count * 4)}ms`;
            if (count >= total) {
                window.clearInterval(timer);
                output.classList.add('ok');
                output.textContent =
                    `3 packets transmitted, 3 received, 0% loss.\n` +
                        `Thanks, ${name} — your message reached its destination. ` +
                        `I'll reply to ${email} as soon as possible.`;
                form.reset();
            }
        }, 380);
    });
}
/* ---------------------------------------------------------------------
   7. Footer year
   --------------------------------------------------------------------- */
function setYear() {
    const el = document.getElementById('year');
    if (el)
        el.textContent = String(new Date().getFullYear());
}
/* ---------------------------------------------------------------------
   Init
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initScrollSpy();
    initRevealOnScroll();
    initMeters();
    buildTopology();
    initPingForm();
    setYear();
});
