export function isClient() {
    return Boolean(process.client);
}

export function paginate(array: any[], page_size: number, page_number: number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

export function chunk(array: any[], size: number) {
    return Array.from({ length: Math.ceil(array.length / size) }, (v, i) => array.slice(i * size, i * size + size));
}

export function refReplacer() {
    let m = new Map(), v= new Map(), init: null = null;
  
    // in TypeScript add "this: any" param to avoid compliation errors - as follows
    //    return function (this: any, field: any, value: any) {
    return function(this: any, field: string, value: any) {
      let p= m.get(this) + (Array.isArray(this) ? `[${field}]` : '.' + field); 
      let isComplex = value === Object(value)
      
      if (isComplex) m.set(value, p);  
      
      let pp = v.get(value)||'';
      let path = p.replace(/undefined\.\.?/,'');
      let val = pp ? `#REF:${pp[0]=='[' ? '$':'$.'}${pp}` : value;
      
      !init ? (init=value) : (val===init ? val="#REF:$" : 0);
      if(!pp && isComplex) v.set(value, path);
     
      return val;
    }
}

export function simpleJSON(obj: any) {
    const copy = Object.assign({}, obj);
    
    Object.keys(copy).forEach(key => {
        if (key.startsWith('_') || ['fileReference', 'bytes', 'apiHash'].includes(key)) {
            delete copy[key];
        } else if (typeof copy[key] === 'object') {
            copy[key] = simpleJSON(copy[key]);
        } else if (typeof copy[key] === 'bigint') {
            copy[key] = copy[key].toString();
        }
    });
    
    return copy;
}

export function safeStringify(obj: any, space = 0) {
    return JSON.stringify(obj, refReplacer(), space);
}

export function humanReadableDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(date);
}

export function humanReadableDateDiff(date: Date): string {
    date = date instanceof Date ? date : new Date(date);

    const diff = Math.abs((new Date()).getTime() - date.getTime());

    if (diff < 24 * 60 * 60 * 1000) {
        const minutes = Math.floor(diff / 1000 / 60);

        const hours = Math.floor(minutes / 60);

        if (minutes < 60) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        }
    }

    return humanReadableDate(date);
}
