let isSupport;

/**
 * detect whether iframe sandbox is supported
 * @return {boolean} -  return true or false
 */
export default function isIframeSandboxSupport() {
  if (isSupport === void 0) {
    isSupport = 'sandbox' in document.createElement('iframe');
  }
  return isSupport;
}
