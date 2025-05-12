export function css(...arg) {
    const cssName = []
    while (arg.length > 0) {
        const item = arg.pop()
        if (typeof item == 'string') {
            cssName.push(...item.split(/\s+/g))
        } else if (typeof item == 'object') {
            cssName.push(...Object.keys(item).filter(k => item[k]))
        }
    }
    return cssName.filter(Boolean).join(' ')
}
