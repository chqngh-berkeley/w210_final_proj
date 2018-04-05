# plumber.R

#* @get /mean
normalMean <- function(samples=10){
  print(samples)
  data <- rnorm(samples)
  mean(data)
}

#* @post /sum
addTwo <- function(a, b){
  as.numeric(a) + as.numeric(b)
}
