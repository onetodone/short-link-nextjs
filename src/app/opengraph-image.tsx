import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/site'

export const alt = `${SITE_NAME} — short links that count their clicks`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 40,
        width: '100%',
        height: '100%',
        padding: 96,
        background: '#0a0a0a',
        color: '#fafafa',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fafafa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <div style={{ fontSize: 56, fontWeight: 600 }}>{SITE_NAME}</div>
      </div>
      <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1, letterSpacing: -2 }}>
        Short links that count their clicks
      </div>
      <div style={{ fontSize: 34, color: '#a3a3a3' }}>
        Shorten a link, change where it leads, see how many people opened it.
      </div>
    </div>,
    { ...size },
  )
}
