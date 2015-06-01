#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson

    # requestObj=simplejson.loads(self.request.body.encode("utf-8"))
    # cmd = requestObj["cmd"]
    # if cmd == "GetUserList":
    #   self.response.out.write(simplejson.dumps(self.Admin_GetUsers()))

data=[]

class MainHandler(webapp.RequestHandler):
    def get(self):
        if self.request.path == "/getData":
            # data=[]
            self.response.out.write(simplejson.dumps(data))
            while (len(data) != 0):
                data.pop()
        else:
            action = self.request.get("action")
            if action:
                data.append(action)
       


def main():
    application = webapp.WSGIApplication([('.*', MainHandler)],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
