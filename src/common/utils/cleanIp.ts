export function getCleanIp(ip: string): string {
    if (ip.startsWith('::ffff:')) return ip.replace('::ffff:', '');
    return ip;
}
