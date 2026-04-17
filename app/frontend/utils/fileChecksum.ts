import SparkMD5 from 'spark-md5'

export const calculateMD5Checksum = async (blob: Blob): Promise<string> => {
  const fileReader = new FileReader()
  const spark = new SparkMD5.ArrayBuffer()

  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    fileReader.onload = () => resolve(fileReader.result as ArrayBuffer)
    fileReader.onerror = () => reject(new Error('Failed to read file'))
    fileReader.readAsArrayBuffer(blob)
  })

  spark.append(arrayBuffer)
  return btoa(spark.end(true))
}
