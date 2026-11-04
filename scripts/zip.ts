/**
 * A minimal, dependency-free ZIP writer: every entry is stored
 * (uncompressed), which is what EPUB requires for `mimetype` and is fine for
 * small sample books. Timestamps are fixed, so the same files always produce
 * the same bytes and the samples test can compare them.
 */
import { crc32 } from 'node:zlib'

import type { ZipEntry } from './types.ts'

// 2026-11-04 00:00:00 in MS-DOS date/time format.
const DOS_TIME = 0
const DOS_DATE = ((2026 - 1980) << 9) | (11 << 5) | 4
const UTF8_FLAG = 0x0800

function header(size: number): { buffer: Buffer; offset: number } {
  return { buffer: Buffer.alloc(size), offset: 0 }
}

function localHeader(name: Buffer, data: Uint8Array, crc: number): Buffer {
  const { buffer } = header(30)
  buffer.writeUInt32LE(0x04034b50, 0)
  buffer.writeUInt16LE(20, 4) // version needed
  buffer.writeUInt16LE(UTF8_FLAG, 6)
  buffer.writeUInt16LE(0, 8) // stored
  buffer.writeUInt16LE(DOS_TIME, 10)
  buffer.writeUInt16LE(DOS_DATE, 12)
  buffer.writeUInt32LE(crc, 14)
  buffer.writeUInt32LE(data.byteLength, 18)
  buffer.writeUInt32LE(data.byteLength, 22)
  buffer.writeUInt16LE(name.byteLength, 26)
  buffer.writeUInt16LE(0, 28) // extra length
  return buffer
}

function centralHeader(
  name: Buffer,
  data: Uint8Array,
  crc: number,
  offset: number
): Buffer {
  const { buffer } = header(46)
  buffer.writeUInt32LE(0x02014b50, 0)
  buffer.writeUInt16LE(20, 4) // version made by
  buffer.writeUInt16LE(20, 6) // version needed
  buffer.writeUInt16LE(UTF8_FLAG, 8)
  buffer.writeUInt16LE(0, 10) // stored
  buffer.writeUInt16LE(DOS_TIME, 12)
  buffer.writeUInt16LE(DOS_DATE, 14)
  buffer.writeUInt32LE(crc, 16)
  buffer.writeUInt32LE(data.byteLength, 20)
  buffer.writeUInt32LE(data.byteLength, 24)
  buffer.writeUInt16LE(name.byteLength, 28)
  // Extra, comment, disk, internal and external attributes stay 0.
  buffer.writeUInt32LE(offset, 42)
  return buffer
}

function endOfCentralDirectory(
  count: number,
  size: number,
  offset: number
): Buffer {
  const { buffer } = header(22)
  buffer.writeUInt32LE(0x06054b50, 0)
  buffer.writeUInt16LE(count, 8)
  buffer.writeUInt16LE(count, 10)
  buffer.writeUInt32LE(size, 12)
  buffer.writeUInt32LE(offset, 16)
  return buffer
}

/** Zips `entries` in order, all stored. */
export function zipStored(entries: readonly ZipEntry[]): Buffer {
  const local: Buffer[] = []
  const central: Buffer[] = []
  let offset = 0
  for (const entry of entries) {
    const name = Buffer.from(entry.path, 'utf8')
    const data = entry.data
    const crc = crc32(data)
    const head = localHeader(name, data, crc)
    local.push(head, name, Buffer.from(data))
    central.push(centralHeader(name, data, crc, offset), name)
    offset += head.byteLength + name.byteLength + data.byteLength
  }
  const directory = Buffer.concat(central)
  return Buffer.concat([
    ...local,
    directory,
    endOfCentralDirectory(entries.length, directory.byteLength, offset)
  ])
}
