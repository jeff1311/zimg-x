#include "httputil.h"

#include <stdio.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <time.h>
#include <errno.h>
#include <signal.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/time.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include "zlog.h"

int sendhttp();

#define IPSTR "127.0.0.1"
#define PORT 4860
#define BUFSIZE 1024

int sendhttp(){

   int sockfd;

   int len;

   struct sockaddr_in address;

   int result;

   char httpstring[100];

   sprintf(httpstring,"GET /xxxxxxxxxxxxxxxxxxxxxx HTTP/1.1\r\n"

         "Host: %s\r\n"

         "Connection: Close\r\n\r\n","127.0.0.1:4860");

   char ch;

   sockfd = socket(AF_INET, SOCK_STREAM, 0);

   address.sin_family = AF_INET;

   address.sin_addr.s_addr = inet_addr(IPSTR);

   address.sin_port = htons(4860);

   len = sizeof(address);

   LOG_PRINT(LOG_DEBUG,"address = %u",address.sin_addr);

   result = connect(sockfd,(struct sockaddr *)&address,len);

   if(result == -1){

      perror("oops: client");

      return 1;

   }

   LOG_PRINT(LOG_DEBUG,"==========sendhttp 66==========");

   write(sockfd,httpstring,strlen(httpstring));

   while(read(sockfd,&ch,1)){

     printf("%c", ch);

   }

   close(sockfd);

   printf("\n");

   return 0;

}
