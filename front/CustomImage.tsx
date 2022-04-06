import { defaultProfileImage } from 'front/config'

// https://stackoverflow.com/questions/34097560/react-js-replace-img-src-onerror
// https://stackoverflow.com/questions/66949606/what-is-the-best-way-to-have-a-fallback-image-in-nextjs
const handleBrokenImage = (e) => {
  e.target.src = defaultProfileImage
  e.target.onerror = null
}

interface CustomImageProps {
  src: string
  alt: string
  className?: string
}

const CustomImage = ({ src, alt, className }: CustomImageProps) => {
  const classes = ['hide-text']
  if (className) {
    classes.push(className)
  }
  return (
    <img
      {...{
        alt,
        src,
        onError: handleBrokenImage,
        className: classes.join(' '),
      }}
    />
  )
}

export default CustomImage
