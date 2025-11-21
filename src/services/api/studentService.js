import { getApperClient } from "@/services/apperClient";

export const studentService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.fetchRecords('students_c', {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "grade_level_c"}},
          {"field": {"Name": "section_c"}},
          {"field": {"Name": "status_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching students:", error?.response?.data?.message || error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const response = await apperClient.getRecordById('students_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "first_name_c"}},
          {"field": {"Name": "last_name_c"}},
          {"field": {"Name": "student_id_c"}},
          {"field": {"Name": "email_c"}},
          {"field": {"Name": "phone_c"}},
          {"field": {"Name": "enrollment_date_c"}},
          {"field": {"Name": "grade_level_c"}},
          {"field": {"Name": "section_c"}},
          {"field": {"Name": "status_c"}}
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  async create(studentData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Name: `${studentData.first_name_c} ${studentData.last_name_c}`,
          first_name_c: studentData.first_name_c,
          last_name_c: studentData.last_name_c,
          student_id_c: studentData.student_id_c,
          email_c: studentData.email_c,
          phone_c: studentData.phone_c,
          enrollment_date_c: studentData.enrollment_date_c,
          grade_level_c: studentData.grade_level_c,
          section_c: studentData.section_c,
          status_c: studentData.status_c
        }]
      };

      const response = await apperClient.createRecord('students_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error creating student:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, studentData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          Name: `${studentData.first_name_c} ${studentData.last_name_c}`,
          first_name_c: studentData.first_name_c,
          last_name_c: studentData.last_name_c,
          student_id_c: studentData.student_id_c,
          email_c: studentData.email_c,
          phone_c: studentData.phone_c,
          enrollment_date_c: studentData.enrollment_date_c,
          grade_level_c: studentData.grade_level_c,
          section_c: studentData.section_c,
          status_c: studentData.status_c
        }]
      };

      const response = await apperClient.updateRecord('students_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        return successful[0]?.data || null;
      }

      return null;
    } catch (error) {
      console.error("Error updating student:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('students_c', params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting student:", error?.response?.data?.message || error);
      throw error;
    }
  }
};