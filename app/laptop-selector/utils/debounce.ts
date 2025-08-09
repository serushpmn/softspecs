export function debounce<F extends (...args: any[]) => void>(fn: F, delay = 300) {
  let timer: any;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
