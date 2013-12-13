/*
 * The Shepherd Project - A Mark-Recapture Framework
 * Copyright (C) 2011 Jason Holmberg
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

package org.ecocean.servlet;

import org.ecocean.*;
import org.ecocean.genetics.*;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;


//Set alternateID for this encounter/sighting
public class TissueSampleRemoveHaplotype extends HttpServlet {

  public void init(ServletConfig config) throws ServletException {
    super.init(config);
  }

  public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    doPost(request, response);
  }

  public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    Shepherd myShepherd = new Shepherd();
    //set up for response
    response.setContentType("text/html");
    PrintWriter out = response.getWriter();
    boolean locked = false;


    myShepherd.beginDBTransaction();
    if ((request.getParameter("analysisID")!=null)&&(request.getParameter("encounter")!=null)&&(request.getParameter("sampleID")!=null)&& (!request.getParameter("sampleID").equals("")) && (myShepherd.isTissueSample(request.getParameter("sampleID"), request.getParameter("encounter")))&&(myShepherd.isEncounter(request.getParameter("encounter")))) {
      try {
        
        Encounter enc = myShepherd.getEncounter(request.getParameter("encounter"));
        TissueSample genSample=myShepherd.getTissueSample(request.getParameter("sampleID"), request.getParameter("encounter"));
        MitochondrialDNAAnalysis mtDNA=myShepherd.getMitochondrialDNAAnalysis(request.getParameter("sampleID"), request.getParameter("encounter"), request.getParameter("analysisID"));
        genSample.removeGeneticAnalysis(mtDNA);
        enc.addComments("<p><em>" + request.getRemoteUser() + " on " + (new java.util.Date()).toString() + "</em><br />" + "Removed haplotype analysis ID "+request.getParameter("analysisID")+".<br />");

        
        myShepherd.throwAwayGeneticAnalysis(mtDNA);  
        
      //check if this affects the MarkedIndividual.localHaplotypeReflection
        if((enc.getIndividualID()!=null)&&(!enc.getIndividualID().equals("Unassigned"))){
            MarkedIndividual indie=myShepherd.getMarkedIndividual(enc.getIndividualID());
            indie.doNotSetLocalHaplotypeReflection(null);
            indie.getHaplotype();
        }
        
      } 
      catch (Exception le) {
        locked = true;
        le.printStackTrace();
        myShepherd.rollbackDBTransaction();
        //myShepherd.closeDBTransaction();
      }

      if (!locked) {
        myShepherd.commitDBTransaction();
        //myShepherd.closeDBTransaction();
        out.println(ServletUtilities.getHeader(request));
        out.println("<strong>Success!</strong> I have successfully removed the haplotype for tissue sample "+request.getParameter("sampleID")+" for encounter " + request.getParameter("encounter") + ".</p>");

        out.println("<p><a href=\"http://" + CommonConfiguration.getURLLocation(request) + "/encounters/encounter.jsp?number=" + request.getParameter("encounter") + "\">Return to encounter " + request.getParameter("encounter") + "</a></p>\n");
        out.println(ServletUtilities.getFooter());
        } 
      else {

        out.println(ServletUtilities.getHeader(request));
        out.println("<strong>Failure!</strong> This encounter is currently being modified by another user or is inaccessible. Please wait a few seconds before trying to modify this encounter again.");

        out.println("<p><a href=\"http://" + CommonConfiguration.getURLLocation(request) + "/encounters/encounter.jsp?number=" + request.getParameter("encounter") + "\">Return to encounter " + request.getParameter("encounter") + "</a></p>\n");
        out.println(ServletUtilities.getFooter());

      }
    } else {
      myShepherd.rollbackDBTransaction();
      out.println(ServletUtilities.getHeader(request));
      out.println("<strong>Error:</strong> I was unable to remove the haplotype. I cannot find the encounter that you intended it for in the database.");
      out.println(ServletUtilities.getFooter());

    }
    out.close();
    myShepherd.closeDBTransaction();
  }


}
  
  
