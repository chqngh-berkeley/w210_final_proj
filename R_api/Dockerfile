FROM rocker/tidyverse
FROM trestletech/plumber
WORKDIR /

RUN apt-get install -y libmariadb-client-lgpl-dev
# RUN R -e "install.packages('broom')"
RUN R -e "devtools::install_github('r-dbi/DBI')"
RUN R -e "devtools::install_github('r-dbi/RMariaDB')"
RUN R -e "install.packages('sqldf',repos = 'http://cran.us.r-project.org')"
RUN R -e "install.packages('dplyr',repos = 'http://cran.us.r-project.org')"

COPY . .
EXPOSE 8282
CMD ["app.R"]
