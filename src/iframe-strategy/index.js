/**
 * iframe 容器 id'
 * @type {string}
 */
import isIframeSandboxSupport from './is-iframe-sandbox-support';

const iframeStrategyContainerId = 'quicklink-iframe-strategy-container';

/**
 * 创建 iframe 策略容器
 * @return {HTMLElement}
 */
function getOrCreateIframeStrategyContainer() {
  let iframeStrategyContainerEl = document.getElementById(iframeStrategyContainerId);
  if (!iframeStrategyContainerEl) {
    iframeStrategyContainerEl = document.createElement('div');
    iframeStrategyContainerEl.id = iframeStrategyContainerId;
    document.body.appendChild(iframeStrategyContainerEl);
  }
  return iframeStrategyContainerEl;
}

/**
 * iframe Strategy
 * @param {string} url - 根据 url 创建 iframe
 * @return {Function} 返回
 */
function createIframe(url) {
  const iframeEl = document.createElement('iframe');
  iframeEl.src = url;
  iframeEl.style.display = 'none';
  if (iframeEl.sandbox && iframeEl.sandbox.add) {
    iframeEl.sandbox.add('allow-scripts', 'allow-same-origin');
  }
  const iframeStrategyContainer = getOrCreateIframeStrategyContainer();
  iframeStrategyContainer.appendChild(iframeEl);
  return () => {
    iframeStrategyContainer.removeChild(iframeEl);
  };
}

/**
 * 清空 iframe 策略容器
 */
function removeIframeStrategyContainer() {
  const iframeStrategyContainer = getOrCreateIframeStrategyContainer();
  iframeStrategyContainer.parentNode.removeChild(iframeStrategyContainer);
}

export {
  createIframe,
  removeIframeStrategyContainer,
  isIframeSandboxSupport,
};
