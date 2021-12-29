import { DEFAULT_PROFILE_IMAGE } from 'lib/utils/constant'

// https://stackoverflow.com/questions/34097560/react-js-replace-img-src-onerror
// https://stackoverflow.com/questions/66949606/what-is-the-best-way-to-have-a-fallback-image-in-nextjs
const handleBrokenImage = (e) => {
  e.target.src = DEFAULT_PROFILE_IMAGE
  e.target.onerror = null
}

interface CustomImageProps {
  src: string
  alt: string
  className?: string
}

const CustomImage = ({ src, alt, className }: CustomImageProps) => {
  const props: any = {}
  const classes = ['hide-text']
  if (className) {
    classes.push(className)
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={handleBrokenImage}
      className={classes.join(' ')}
      {...props}
    />
  )
}

export default CustomImage
