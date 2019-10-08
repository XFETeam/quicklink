/**
 * Copyright 2018 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import prefetch from './prefetch.mjs';
import requestIdleCallback from './request-idle-callback.mjs';
import {removeIframeStrategyContainer} from './iframe-strategy';

const toPrefetch = new Set();

const observer = window.IntersectionObserver && new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = entry.target;
      if (toPrefetch.has(link.href)) {
        observer.unobserve(link);
        prefetcher(link.href);
      }
    }
  });
});

/**
 * Prefetch a supplied URL. This will also remove
 * the URL from the toPrefetch Set.
 * @param {String} url - URL to prefetch
 */
function prefetcher(url) {
  toPrefetch.delete(url);
  prefetch(new URL(url, location.href).toString(), observer.priority, observer.useIframeStrategy);
}

/**
 * Determine if the anchor tag should be prefetched.
 * A filter can be a RegExp, Function, or Array of both.
 *   - Function receives `node.href, node` arguments
 *   - RegExp receives `node.href` only (the full URL)
 * @param  {Element}  node    The anchor (<a>) tag.
 * @param  {Mixed}    filter  The custom filter(s)
 * @return {Boolean}          If true, then it should be ignored
 */
function isIgnored(node, filter) {
  return Array.isArray(filter)
    ? filter.some(x => isIgnored(node, x))
    : (filter.test || filter).call(filter, node.href, node);
}

/**
 * 判断 link is inside links or not
 * @param {(string|RegExp)[]} links - 链接列表
 * @param {string} link - 链接
 * @return {Boolean} url - 是否包含
 */
function includes(links, link) {
  return links.some(function (l) {
    return '[object RegExp]' === Object.prototype.toString.call(l) ? l.test(link) : l === link;
  });
}

/**
 * Prefetch an array of URLs if the user's effective
 * connection type and data-saver preferences suggests
 * it would be useful. By default, looks at in-viewport
 * links for `document`. Can also work off a supplied
 * DOM element or static array of URLs.
 * @param {Object} options - Configuration options for quicklink
 * @param {Array} options.urls - Array of URLs to prefetch (override)
 * @param {Object} options.el - DOM element to prefetch in-viewport links of
 * @param {Boolean} options.priority - Attempt higher priority fetch (low or high)
 * @param {Array} options.origins - Allowed origins to prefetch (empty allows all)
 * @param {Array|RegExp|Function} options.ignores - Custom filter(s) that run after origin checks
 * @param {Number} options.timeout - Timeout after which prefetching will occur
 * @param {Function} options.timeoutFn - Custom timeout function
 * @param {Boolean} options.useIframeStrategy - Whether to use iframe to prefetch
 *
 */
function quicklink(options) {
  if (!options) options = {};

  observer && (observer.priority = options.priority || false);

  const allowed = options.origins || [location.hostname];
  const ignores = options.ignores || [];

  const timeout = options.timeout || 2e3;
  const timeoutFn = options.timeoutFn || requestIdleCallback;

  observer && (observer.useIframeStrategy = options.useIframeStrategy);

  timeoutFn(() => {
    // If URLs are given, prefetch them.
    if (options.urls) {
      options.urls.forEach(url => {
        prefetcher(url);
      });
    } else if (observer) {
      // If not, find all links and use IntersectionObserver.
      Array.from((options.el || document).querySelectorAll('a'), link => {
        observer.observe(link);
        // If the anchor matches a permitted origin
        // ~> A `[]` or `true` means everything is allowed
        if (!allowed.length || includes(allowed, link.hostname)) {
          // If there are any filters, the link must not match any of them
          isIgnored(link, ignores) || toPrefetch.add(link.href);
        }
      });
    }
  }, {timeout});
}

quicklink.removeIframeStrategyContainer = removeIframeStrategyContainer;

export default quicklink;
