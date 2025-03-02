export function clickOutside(node: HTMLElement, params: { enabled: boolean; callback: () => void }) {
  let { enabled, callback } = params;

  const handleClick = (event: MouseEvent) => {
    if (!enabled) return;
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      callback();
    }
  };
  
  document.addEventListener('click', handleClick, true);
  
  return {
    update(newParams: { enabled: boolean; callback: () => void }) {
      enabled = newParams.enabled;
      callback = newParams.callback;
    },
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
} 